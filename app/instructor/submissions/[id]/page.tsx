import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseSubmissionEditor from "@/components/instructor/CourseSubmissionEditor";
import { requireInstructorPage } from "@/lib/server/auth";
import { getCourseSubmissionById } from "@/lib/server/course-submissions";

interface InstructorSubmissionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InstructorSubmissionDetailsPage({
  params,
}: InstructorSubmissionDetailsPageProps) {
  const { id } = await params;
  const { supabase, user } = await requireInstructorPage({
    loginRedirect: `/login?redirect=/instructor/submissions/${id}`,
    fallbackRedirect: "/instructor",
  });

  const submission = await getCourseSubmissionById(id, {
    instructorId: user.id,
    supabase,
  });

  if (!submission) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/instructor/submissions"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Submissionlarga qaytish
      </Link>

      <CourseSubmissionEditor
        mode="edit"
        submissionId={submission.id}
        initialData={{
          slug: submission.payload.id,
          title: submission.payload.title,
          subtitle: submission.payload.subtitle,
          description: submission.payload.description,
          price: submission.payload.price,
          duration: submission.payload.duration,
          pace: submission.payload.pace,
          level: submission.payload.level,
          category: submission.payload.category,
          language: submission.payload.language as "uz" | "ru" | "en",
          heroGradient: submission.payload.heroGradient,
          cardImage: submission.payload.cardImage ?? "",
          outcomes: submission.payload.outcomes,
          supportItems: submission.payload.supportItems,
          reviews: submission.payload.reviews,
          certificateTemplate:
            submission.payload.certificateTemplate ?? {
              title: `${submission.payload.title} Certificate`,
              organizationName: "Kings Education",
              signatureName: submission.payload.instructor,
              signatureTitle: "Instructor",
              certificateBody:
                "has successfully completed the course requirements and demonstrated practical learning progress.",
              accentColor: "#064e3b",
              sealText: "KINGS VERIFIED",
            },
          modules: submission.payload.modules.map((module) => ({
            id: module.id,
            title: module.title,
            description: module.description,
            lessons: module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              duration: lesson.duration,
              isFree: lesson.isFree,
              summary: lesson.summary,
              videoUrl: lesson.videoUrl ?? "",
              videoMimeType: lesson.videoMimeType ?? "video/mp4",
              resources: lesson.resources,
            })),
          })),
        }}
        initialStatus={submission.status}
        initialReviewNote={submission.review_note}
      />
    </div>
  );
}
