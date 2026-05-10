import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { formatCourseSubmissionStatus } from "@/lib/course-submissions";
import { requireInstructorPage } from "@/lib/server/auth";
import { getInstructorCourseSubmissions } from "@/lib/server/course-submissions";

export default async function InstructorSubmissionsPage() {
  const { supabase, user } = await requireInstructorPage({
    loginRedirect: "/login?redirect=/instructor/submissions",
    fallbackRedirect: "/instructor",
  });

  const submissions = await getInstructorCourseSubmissions(user.id, supabase);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kurs submissionlar
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Draftlarni tayyorlang, public qiling va admin feedback bilan ishlang.
          </p>
        </div>
        <Link
          href="/instructor/submissions/new"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Yangi submission
        </Link>
      </div>

      <div className="grid gap-4">
        {submissions.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
            Hali submissionlar yo&apos;q. Birinchi kurs draftini yarating.
          </div>
        ) : (
          submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {submission.title}
                    </h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                      {formatCourseSubmissionStatus(submission.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    /courses/{submission.slug}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {submission.description}
                  </p>
                  {submission.review_note ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                      <strong>Admin izohi:</strong> {submission.review_note}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="text-xs text-gray-400">
                    Yangilangan:{" "}
                    {new Date(submission.updated_at).toLocaleString("uz-UZ")}
                  </div>
                  <Link
                    href={`/instructor/submissions/${submission.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    Submissionni ochish <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
