import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CourseSubmissionEditor from "@/components/instructor/CourseSubmissionEditor";
import { requireInstructorPage } from "@/lib/server/auth";

export default async function NewInstructorSubmissionPage() {
  await requireInstructorPage({
    loginRedirect: "/login?redirect=/instructor/submissions/new",
    fallbackRedirect: "/instructor",
  });

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/instructor/submissions"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Submissionlarga qaytish
      </Link>

      <CourseSubmissionEditor mode="create" />
    </div>
  );
}
