"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";

interface AssetUploadFormProps {
  submissions: Array<{
    id: string;
    slug: string;
    title: string;
    modules: Array<{
      id: string;
      title: string;
      lessons: Array<{ id: string; title: string }>;
    }>;
  }>;
}

export default function AssetUploadForm({ submissions }: AssetUploadFormProps) {
  const router = useRouter();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(
    submissions[0]?.id ?? ""
  );
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedSubmission = submissions.find(
    (submission) => submission.id === selectedSubmissionId
  );
  const lessons =
    selectedSubmission?.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
    ) ?? [];
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  function upload(formData: FormData) {
    setFeedback("");
    startTransition(async () => {
      if (!selectedSubmission) {
        setFeedback("Avval published kurs tanlang.");
        return;
      }

      formData.set("submission_id", selectedSubmission.id);
      formData.set("course_id", selectedSubmission.slug);
      if (selectedLesson) {
        formData.set("lesson_id", selectedLesson.id);
        formData.set("module_id", selectedLesson.moduleId);
      }

      const response = await fetch("/api/instructor/assets", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setFeedback(payload?.error ?? "Upload amalga oshmadi");
        return;
      }

      setFeedback("Fayl yuklandi va analiz metadata saqlandi.");
      router.refresh();
    });
  }

  return (
    <form
      action={upload}
      className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/40 dark:bg-gray-950"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <UploadCloud className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-black text-gray-950 dark:text-white">
            Video / resurs yuklash
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            MP4, WEBM, MOV, PDF yoki rasm fayllari `course-media` bucketiga tushadi.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Kurs
          <select
            value={selectedSubmissionId}
            onChange={(event) => {
              setSelectedSubmissionId(event.target.value);
              setSelectedLessonId("");
            }}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            {submissions.length === 0 ? (
              <option value="">Published kurs yo'q</option>
            ) : (
              submissions.map((submission) => (
                <option key={submission.id} value={submission.id}>
                  {submission.title}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Lesson
          <select
            value={selectedLessonId}
            onChange={(event) => setSelectedLessonId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Umumiy kurs asseti</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.moduleTitle} - {lesson.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Asset nomi
          <input
            name="title"
            placeholder="Lesson 1 HD video"
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </label>

        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          Fayl
          <input
            name="file"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,application/pdf,image/png,image/jpeg"
            required
            className="mt-2 w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm normal-case tracking-normal text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {feedback || "Upload qilingandan keyin asset instructor panelda ko'rinadi."}
        </p>
        <button
          type="submit"
          disabled={isPending || submissions.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud className="h-4 w-4" />
          {isPending ? "Yuklanmoqda..." : "Upload"}
        </button>
      </div>
    </form>
  );
}
