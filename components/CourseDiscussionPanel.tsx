"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, MessageCircle, ShieldCheck, Send } from "lucide-react";

interface StudentReputation {
  creditScore: number;
  violationsCount: number;
  warningAcknowledgedAt: string | null;
  mutedUntil: string | null;
  pricingPenaltyPercent: number;
  backendReady: boolean;
}

interface CourseDiscussionMessage {
  id: string;
  userId: string;
  authorName: string;
  body: string;
  status: string;
  moderationReason: string | null;
  penaltyPoints: number;
  createdAt: string;
  isOwn: boolean;
}

function getCreditTone(score: number) {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-100";
  return "text-red-700 bg-red-50 border-red-100";
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("uz-UZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CourseDiscussionPanel({
  courseId,
  lessonId,
  isEnrolled,
}: {
  courseId: string;
  lessonId: string;
  isEnrolled: boolean;
}) {
  const [messages, setMessages] = useState<CourseDiscussionMessage[]>([]);
  const [reputation, setReputation] = useState<StudentReputation | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isEnrolled) return;

    fetch(`/api/course-discussions?courseId=${courseId}`, { cache: "no-store" })
      .then((response) => response.json())
      .then(
        (payload: {
          messages?: CourseDiscussionMessage[];
          reputation?: StudentReputation;
          error?: string;
        }) => {
          setMessages(payload.messages ?? []);
          setReputation(payload.reputation ?? null);
          setAcceptedRules(Boolean(payload.reputation?.warningAcknowledgedAt));
          if (payload.error) setError(payload.error);
        }
      )
      .catch(() => setError("Discussion yuklanmadi."));
  }, [courseId, isEnrolled]);

  const mutedUntil = reputation?.mutedUntil;
  const muted = mutedUntil ? new Date(mutedUntil) > new Date() : false;

  function submitMessage() {
    if (!message.trim() || isPending) return;

    startTransition(async () => {
      setError("");
      setFeedback("");

      const response = await fetch("/api/course-discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          message,
          acknowledgeRules: acceptedRules,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            message?: CourseDiscussionMessage;
            reputation?: StudentReputation;
            error?: string;
            requiresAcknowledgement?: boolean;
          }
        | null;

      if (payload?.reputation) {
        setReputation(payload.reputation);
        setAcceptedRules(Boolean(payload.reputation.warningAcknowledgedAt));
      }

      if (!response.ok) {
        setError(payload?.error ?? "Xabar yuborilmadi.");
        return;
      }

      if (payload?.message) {
        setMessages((current) => [...current, payload.message!]);
      }

      setMessage("");

      if (payload?.message?.status === "blocked") {
        setError(
          payload.message.moderationReason ??
            "Xabar qoidaga mos kelmagani uchun ko'rsatilmadi."
        );
        return;
      }

      setFeedback("Xabar course discussionga qo'shildi.");
    });
  }

  if (!isEnrolled) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-xl rounded-[2rem] border border-sky-200 bg-sky-50 p-8 text-center dark:border-sky-900/30 dark:bg-sky-950/20">
          <MessageCircle className="mx-auto h-8 w-8 text-sky-600" />
          <h3 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
            Course discussion enrolled studentlar uchun
          </h3>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Kursga yozilgandan keyin shu kursdagi boshqa studentlar bilan dars
            bo'yicha muhokama qilishingiz mumkin.
          </p>
        </div>
      </div>
    );
  }

  const needsWarning = !(acceptedRules || reputation?.warningAcknowledgedAt);

  return (
    <div className="flex h-[540px] flex-col">
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-950 dark:text-white">
              Student discussion
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Faqat shu kursga enroll bo'lgan studentlar ko'radigan learning chat.
            </p>
          </div>
          {reputation ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-black ${getCreditTone(
                reputation.creditScore
              )}`}
            >
              Credit score: {reputation.creditScore}
              {reputation.pricingPenaltyPercent > 0 ? (
                <span className="ml-2 text-xs">
                  +{reputation.pricingPenaltyPercent}% future pricing risk
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {needsWarning ? (
          <div className="mb-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <h4 className="font-black">Discussion qoidalari</h4>
                <p className="mt-2 text-sm leading-7">
                  Haqorat, so'kinish, kamsitish, spam va darsdan tashqari janjal
                  yozish mumkin emas. Qoidani buzgan xabar ko'rinmaydi, credit
                  score kamayadi va keyingi kurslarga yozilish narxiga ta'sir qilishi mumkin.
                </p>
                <button
                  type="button"
                  onClick={() => setAcceptedRules(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2 text-sm font-black text-white hover:bg-amber-800"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Qoidalarni tushundim
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Hali discussion boshlanmagan. Birinchi foydali savol yoki fikrni yozing.
            </div>
          ) : (
            messages.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  item.status === "blocked"
                    ? "border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                    : item.isOwn
                      ? "border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
                      : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-gray-950 dark:text-white">
                    {item.authorName}
                    {item.isOwn ? (
                      <span className="ml-2 text-xs font-semibold text-blue-600">
                        siz
                      </span>
                    ) : null}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                {item.status === "blocked" ? (
                  <p className="text-sm leading-7 text-red-700 dark:text-red-200">
                    {item.moderationReason ??
                      "Xabar discussion qoidalariga mos kelmagani uchun bloklandi."}
                    {item.penaltyPoints > 0 ? (
                      <span className="mt-2 block font-black">
                        -{item.penaltyPoints} credit score
                      </span>
                    ) : null}
                  </p>
                ) : (
                  <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
                    {item.body}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-800 md:px-6">
        {error ? (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </p>
        ) : feedback ? (
          <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
            {feedback}
          </p>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            disabled={isPending || needsWarning || muted}
            placeholder={
              muted
                ? "Credit score sababli vaqtincha cheklov bor..."
                : needsWarning
                  ? "Avval discussion qoidalarini tasdiqlang..."
                  : "Dars yoki kurs bo'yicha foydali fikr yozing..."
            }
            className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 outline-none focus:border-sky-500 focus:bg-white disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
          />
          <button
            type="button"
            disabled={
              isPending || needsWarning || muted || message.trim().length < 2
            }
            onClick={submitMessage}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
