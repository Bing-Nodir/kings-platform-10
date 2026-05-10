"use client";

import { useEffect, useState, useTransition } from "react";
import { MessageSquare, Send } from "lucide-react";

interface CourseQuestion {
  id: string;
  lesson_id: string | null;
  question_text: string;
  answer_text: string | null;
  status: string;
  created_at: string;
  answered_at?: string | null;
}

export default function CourseQuestionPanel({
  courseId,
  lessonId,
  isEnrolled,
}: {
  courseId: string;
  lessonId: string;
  isEnrolled: boolean;
}) {
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isEnrolled) return;
    fetch(`/api/course-questions?courseId=${courseId}`)
      .then((response) => response.json())
      .then((payload: { questions?: CourseQuestion[] }) => {
        setQuestions(payload.questions ?? []);
      })
      .catch(() => undefined);
  }, [courseId, isEnrolled]);

  function submitQuestion() {
    if (!question.trim()) {
      return;
    }

    startTransition(async () => {
      setFeedback("");
      const response = await fetch("/api/course-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          question,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { question?: CourseQuestion; error?: string }
        | null;

      if (!response.ok) {
        setFeedback(payload?.error ?? "Savol yuborilmadi");
        return;
      }

      if (payload?.question) {
        setQuestions((current) => [payload.question!, ...current]);
      }
      setQuestion("");
      setFeedback("Savol instructor paneliga yuborildi.");
    });
  }

  if (!isEnrolled) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-xl rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <MessageSquare className="mx-auto h-8 w-8 text-emerald-600" />
          <h3 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
            Instructor savol-javobi premium access ichida
          </h3>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Kursga yozilgandan keyin savollar bevosita instructor paneliga tushadi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <h3 className="text-xl font-black text-gray-950 dark:text-white">
          Instructor savol-javob
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Savolingiz instructor paneliga real ticket sifatida tushadi.
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={5}
          placeholder="Dars bo'yicha savolingizni yozing..."
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Joriy lesson ID: {lessonId}
          </p>
          <button
            type="button"
            disabled={isPending || question.trim().length < 5}
            onClick={submitQuestion}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isPending ? "Yuborilmoqda..." : "Savol yuborish"}
          </button>
        </div>
        {feedback ? (
          <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Hali savol yuborilmagan.
          </div>
        ) : (
          questions.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold leading-7 text-gray-900 dark:text-white">
                  {item.question_text}
                </p>
                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  {item.status}
                </span>
              </div>
              {item.answer_text ? (
                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                  {item.answer_text}
                </div>
              ) : (
                <p className="mt-4 text-xs text-gray-400">
                  Instructor javobi kutilmoqda.
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
