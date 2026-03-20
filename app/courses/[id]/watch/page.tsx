import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Lock, MessageSquare, PlayCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getCourseById, getCoursePreviewLessons } from "@/lib/catalog";
import { resolveLessonMedia } from "@/lib/server/course-media";
import WatchClient from "./WatchClient";

interface CourseWatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function CourseWatchPage({
  params,
  searchParams,
}: CourseWatchPageProps) {
  const { id } = await params;
  const { lesson } = await searchParams;
  const course = getCourseById(id);

  if (!course) {
    notFound();
  }

  const previewLessons = getCoursePreviewLessons(course);
  const previewLessonIds = previewLessons.map((item) => item.id);
  const fallbackLessonId = previewLessonIds[0] ?? course.modules[0]?.lessons[0]?.id;

  if (!fallbackLessonId) {
    notFound();
  }

  const courseWithResolvedMedia = {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => {
        const media = resolveLessonMedia(course.id, lesson.id);

        return {
          ...lesson,
          videoUrl: media.isUploaded ? media.videoUrl : undefined,
          videoMimeType: media.isUploaded ? media.videoMimeType : undefined,
          uploadFilePath: media.uploadFilePath,
        };
      }),
    })),
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let progressPercent = 0;
  let isEnrolled = false;
  let lastLessonId: string | null = null;

  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("progress_percent, completed_at, last_lesson_id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (enrollment) {
      isEnrolled = true;
      progressPercent = enrollment.progress_percent ?? 0;
      lastLessonId = enrollment.last_lesson_id ?? null;
    }
  }

  if (!isEnrolled && lesson && !previewLessonIds.includes(lesson)) {
    redirect(`/checkout?type=course&id=${course.id}`);
  }

  const initialLessonId = isEnrolled
    ? lesson ?? lastLessonId ?? course.modules[0]?.lessons[0]?.id ?? fallbackLessonId
    : lesson && previewLessonIds.includes(lesson)
      ? lesson
      : fallbackLessonId;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 md:px-6">
        <div className="flex items-center gap-4">
          <Link
            href={isEnrolled ? "/dashboard" : `/courses/${course.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              {isEnrolled ? "Learning room" : "Preview room"}
            </p>
            <h1 className="line-clamp-1 text-base font-semibold text-gray-900 dark:text-white md:text-lg">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isEnrolled ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              <BarChart3 className="h-4 w-4" />
              {progressPercent}% progress
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
              <PlayCircle className="h-4 w-4" />
              {previewLessonIds.length} ta bepul preview
            </div>
          )}
          <Link
            href={`/courses/${id}`}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <MessageSquare className="h-4 w-4" /> Kurs sahifasi
          </Link>
          {!isEnrolled && (
            <Link
              href={`/checkout?type=course&id=${course.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              <Lock className="h-4 w-4" /> To&apos;liq access
            </Link>
          )}
        </div>
      </header>

      <WatchClient
        course={courseWithResolvedMedia}
        initialProgress={progressPercent}
        initialLessonId={initialLessonId}
        isEnrolled={isEnrolled}
        canUseMentor={Boolean(user && isEnrolled)}
        checkoutHref={`/checkout?type=course&id=${course.id}`}
      />
    </div>
  );
}
