"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import {
  createEmptyCourseSubmissionForm,
  formatCourseSubmissionStatus,
  type CourseSubmissionFormData,
  type CourseSubmissionStatus,
} from "@/lib/course-submissions";
import SubmissionBasicsSection from "./SubmissionBasicsSection";
import SubmissionSupportSection from "./SubmissionSupportSection";
import SubmissionReviewsSection from "./SubmissionReviewsSection";
import SubmissionModulesSection from "./SubmissionModulesSection";

export default function CourseSubmissionEditor({
  initialData,
  mode,
  submissionId,
  initialStatus = "draft",
  initialReviewNote,
}: {
  initialData?: CourseSubmissionFormData;
  mode: "create" | "edit";
  submissionId?: string;
  initialStatus?: CourseSubmissionStatus;
  initialReviewNote?: string | null;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseSubmissionFormData>(
    initialData ?? createEmptyCourseSubmissionForm()
  );
  const [submissionStatus, setSubmissionStatus] =
    useState<CourseSubmissionStatus>(initialStatus);
  const [reviewNote, setReviewNote] = useState(initialReviewNote ?? "");
  const [feedback, setFeedback] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFormData(initialData ?? createEmptyCourseSubmissionForm());
    setSubmissionStatus(initialStatus);
    setReviewNote(initialReviewNote ?? "");
  }, [initialData, initialStatus, initialReviewNote]);

  function updateField<K extends keyof CourseSubmissionFormData>(
    key: K,
    value: CourseSubmissionFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
    setFeedback({ tone: "idle", message: "" });
  }

  function save(intent: "save" | "submit") {
    startTransition(async () => {
      try {
        const response = await fetch("/api/instructor/submissions", {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: submissionId,
            intent,
            submission: formData,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
              id?: string;
              status?: CourseSubmissionStatus;
              reviewNote?: string | null;
            }
          | null;

        if (!response.ok) {
          throw new Error(
            payload?.error || "Submissionni saqlashda xatolik yuz berdi."
          );
        }

        if (payload?.status) {
          setSubmissionStatus(payload.status);
        }

        if (typeof payload?.reviewNote === "string") {
          setReviewNote(payload.reviewNote);
        }

        setFeedback({
          tone: "success",
          message:
            intent === "submit"
              ? "Kurs public catalogga chiqarildi."
              : "Draft muvaffaqiyatli saqlandi.",
        });

        const nextId = payload?.id ?? submissionId;
        if (nextId && (mode === "create" || nextId !== submissionId)) {
          router.push(`/instructor/submissions/${nextId}`);
        }
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Noma'lum xatolik yuz berdi.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              {mode === "create" ? "New submission" : "Edit submission"}
            </p>
            <h1 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
              {formData.title || "Yangi kurs drafti"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
              Tasdiqlangan instructor kursni draft sifatida tayyorlaydi. Submit
              bosilganda kurs public catalogga chiqadi, admin esa istalgan vaqtda
              edit yoki archive qila oladi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                {formatCourseSubmissionStatus(submissionStatus)}
              </span>
              {formData.slug ? (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  /courses/{formData.slug}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => save("save")}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Draft saqlash
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => save("submit")}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Public qilish
            </button>
          </div>
        </div>
      </div>

      {reviewNote ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <strong>Admin izohi:</strong> {reviewNote}
        </div>
      ) : null}

      {feedback.message ? (
        <div
          className={`rounded-2xl px-5 py-4 text-sm ${
            feedback.tone === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
              : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <SubmissionBasicsSection
        formData={formData}
        onFieldChange={updateField}
      />
      <SubmissionSupportSection
        formData={formData}
        onFieldChange={updateField}
      />
      <SubmissionReviewsSection
        formData={formData}
        onFieldChange={updateField}
      />
      <SubmissionModulesSection
        formData={formData}
        onFieldChange={updateField}
      />
    </div>
  );
}
