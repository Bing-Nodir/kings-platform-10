import { ClipboardCheck, UserCheck } from "lucide-react";
import { formatCourseSubmissionStatus } from "@/lib/course-submissions";
import { createClient } from "@/utils/supabase/server";
import {
  reviewCourseSubmission,
  reviewInstructorApplication,
} from "./actions";

const STATUS_ORDER: Record<string, number> = {
  submitted: 0,
  changes_requested: 1,
  draft: 2,
  published: 3,
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("course_submissions")
    .select(
      "id, instructor_id, slug, title, description, status, review_note, submitted_at, updated_at, payload"
    );
  const { data: applications } = await supabase
    .from("instructor_applications")
    .select(
      "id, user_id, professional_title, organization_name, contact_email, contact_phone, public_bio, photo_url, expertise, portfolio_url, payout_method, certificates, certificate_template, statement, status, admin_note, submitted_at, reviewed_at, updated_at"
    )
    .order("submitted_at", { ascending: false });

  const instructorIds = Array.from(
    new Set([
      ...(submissions ?? []).map((item) => item.instructor_id),
      ...(applications ?? []).map((item) => item.user_id),
    ])
  );
  const { data: profiles } = instructorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", instructorIds)
    : { data: [] as Array<{ id: string; full_name: string | null; email: string | null }> };

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );
  const sortedSubmissions = [...(submissions ?? [])].sort((first, second) => {
    const byStatus =
      (STATUS_ORDER[first.status] ?? 99) - (STATUS_ORDER[second.status] ?? 99);
    if (byStatus !== 0) {
      return byStatus;
    }

    return (
      new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime()
    );
  });

  const summary = {
    total: sortedSubmissions.length,
    pending: sortedSubmissions.filter((item) => item.status === "submitted").length,
    changes: sortedSubmissions.filter((item) => item.status === "changes_requested")
      .length,
    published: sortedSubmissions.filter((item) => item.status === "published").length,
  };
  const applicationSummary = {
    total: applications?.length ?? 0,
    pending: (applications ?? []).filter((item) => item.status === "pending").length,
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Course Review Queue
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Instructor yuborgan kurslar admin tasdig'i bilan public saytga chiqadi.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
          <ClipboardCheck className="h-3.5 w-3.5" />
          Editorial gate
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Jami", value: summary.total },
          { label: "Review kutilmoqda", value: summary.pending },
          { label: "Changes requested", value: summary.changes },
          { label: "Instructor arizalar", value: applicationSummary.pending },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-black text-gray-950 dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-[2rem] border border-emerald-100 bg-white shadow-sm dark:border-emerald-900/30 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-gray-950 dark:text-white">
                Instructor Applications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Student ariza yuboradi, admin approve qilsa role instructor bo'ladi.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            {applicationSummary.pending} pending
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {(applications ?? []).length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              Hali instructor ariza yo'q
            </div>
          ) : (
            (applications ?? []).map((application) => {
              const profile = profilesById.get(application.user_id);

              return (
                <article
                  key={application.id}
                  className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-gray-950 dark:text-white">
                        {profile?.full_name ?? profile?.email ?? "User"}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                        {application.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {application.professional_title ?? "Professional title kiritilmagan"}
                    </p>
                    <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-950 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-100 md:grid-cols-2">
                      <span>
                        Tashkilot: {application.organization_name ?? "N/A"}
                      </span>
                      <span>Email: {application.contact_email ?? profile?.email ?? "N/A"}</span>
                      <span>Telefon: {application.contact_phone ?? "N/A"}</span>
                      <span>Portfolio: {application.portfolio_url ?? "N/A"}</span>
                    </div>
                    {application.public_bio ? (
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-400">
                        <strong>Public bio:</strong> {application.public_bio}
                      </p>
                    ) : null}
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-400">
                      {application.statement}
                    </p>
                    <div className="mt-4 grid gap-3 text-sm text-gray-500 md:grid-cols-2">
                      <span>Expertise: {application.expertise ?? "N/A"}</span>
                      <span>Payout: {application.payout_method ?? "N/A"}</span>
                      <span>Rasm: {application.photo_url ?? "N/A"}</span>
                      <span>
                        Submitted: {new Date(application.submitted_at).toLocaleString("uz-UZ")}
                      </span>
                    </div>
                    {Array.isArray(application.certificates) &&
                    application.certificates.length > 0 ? (
                      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                        <p className="font-black text-gray-950 dark:text-white">
                          Credentiallar
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {application.certificates.map((certificate) =>
                            typeof certificate === "string" ? (
                              <span
                                key={certificate}
                                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-950 dark:text-gray-200"
                              >
                                {certificate}
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                    ) : null}
                    {application.admin_note ? (
                      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                        Admin izohi: {application.admin_note}
                      </div>
                    ) : null}
                  </div>

                  <form
                    action={reviewInstructorApplication}
                    className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <input
                      type="hidden"
                      name="application_id"
                      value={application.id}
                    />
                    <textarea
                      name="note"
                      rows={4}
                      defaultValue={application.admin_note ?? ""}
                      placeholder="Admin izohi"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        name="decision"
                        value="approved"
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve instructor
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="changes_requested"
                        className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-300"
                      >
                        Tuzatish so'rash
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="rejected"
                        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300"
                      >
                        Reject
                      </button>
                    </div>
                  </form>
                </article>
              );
            })
          )}
        </div>
      </section>

      <div className="grid gap-4">
        {sortedSubmissions.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
            Hali review queue bo'sh
          </div>
        ) : (
          sortedSubmissions.map((submission) => {
            const profile = profilesById.get(submission.instructor_id);
            const payload = submission.payload as { modules?: Array<{ lessons?: unknown[] }> };
            const moduleCount = payload.modules?.length ?? 0;
            const lessonCount =
              payload.modules?.reduce(
                (sum, module) => sum + (module.lessons?.length ?? 0),
                0
              ) ?? 0;

            return (
              <div
                key={submission.id}
                className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
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
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                      <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                        {moduleCount} modul
                      </span>
                      <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                        {lessonCount} lesson
                      </span>
                      <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                        {profile?.full_name ?? profile?.email ?? "Instructor"}
                      </span>
                    </div>
                    {submission.review_note ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                        <strong>Oxirgi admin izohi:</strong> {submission.review_note}
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full max-w-xl rounded-[1.75rem] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <form action={reviewCourseSubmission} className="space-y-4">
                      <input
                        type="hidden"
                        name="submission_id"
                        value={submission.id}
                      />
                      <textarea
                        name="note"
                        rows={4}
                        defaultValue={submission.review_note ?? ""}
                        placeholder="Admin izohi yoki editorial feedback"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          name="decision"
                          value="changes_requested"
                          className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-950/20"
                        >
                          Tuzatish so'rash
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="published"
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve va publish
                        </button>
                      </div>
                    </form>
                    <p className="mt-3 text-xs text-gray-400">
                      Yangilangan:{" "}
                      {new Date(submission.updated_at).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
