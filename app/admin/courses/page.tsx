import Link from "next/link";
import {
  ArrowRight,
  Archive,
  Clock,
  FileText,
  PlayCircle,
  Save,
  Star,
  UploadCloud,
  Users,
  Video,
} from "lucide-react";
import { archiveCourse, updateCourseBasics } from "./actions";
import { getCoursePreviewLessons } from "@/lib/catalog";
import { getCoursesData } from "@/lib/content-store";
import { resolveLessonMedia } from "@/lib/server/course-media";

const levelColors: Record<string, string> = {
  "Boshlang'ich":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  "O'rta": "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  Yuqori:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
  "Barcha daraja":
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const managedCourseIds = new Set([
  "python-analytics-automation",
  "data-analytics-professional",
]);

type AdminCoursesPageProps = {
  searchParams: Promise<{
    course_status?: string;
    course?: string;
  }>;
};

const actionMessages: Record<
  string,
  { tone: "success" | "error"; text: string }
> = {
  updated: {
    tone: "success",
    text: "Kurs saqlandi va public sahifalar cache'i yangilandi.",
  },
  archived: {
    tone: "success",
    text: "Kurs public katalogdan olib tashlandi.",
  },
  "missing-backend": {
    tone: "error",
    text: "Supabase'da site_documents jadvali yo'q. Migrationlarni ishga tushirish kerak.",
  },
  "not-found": {
    tone: "error",
    text: "Kurs topilmadi yoki allaqachon o'chirilgan.",
  },
  blocked: {
    tone: "error",
    text: "Action bajarilmadi. Admin sessiya, RLS yoki Supabase ulanishini tekshiring.",
  },
};

export default async function AdminCoursesPage({
  searchParams,
}: AdminCoursesPageProps) {
  const { course_status: courseStatus } = await searchParams;
  const actionMessage = courseStatus ? actionMessages[courseStatus] : null;
  const courses = await getCoursesData();
  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);
  const averageRating =
    courses.length > 0
      ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length
      : 0;
  const managedCourses = courses
    .filter((course) => managedCourseIds.has(course.id))
    .map((course) => {
      const lessons = course.modules.flatMap((module) =>
        module.lessons.map((lesson) => {
          const media = resolveLessonMedia(course.id, lesson.id);

          return {
            ...lesson,
            videoUrl: media.videoUrl,
            videoMimeType: media.videoMimeType,
            uploadFilePath: media.uploadFilePath,
            isUploaded: media.isUploaded,
          };
        })
      );
      const uploadReadyLessons = lessons.filter((lesson) => lesson.uploadFilePath);
      const uploadedLessons = uploadReadyLessons.filter((lesson) =>
        lesson.isUploaded
      );
      const downloadableResources = lessons.reduce(
        (sum, lesson) =>
          sum + lesson.resources.filter((resource) => resource.href !== "#").length,
        0
      );

      return {
        ...course,
        lessons,
        uploadReadyLessons,
        uploadedLessons,
        downloadableResources,
      };
    });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kurslar
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {courses.length} ta aktiv kurs. Public katalog, preview room va checkout
            bilan sinxron ishlaydi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Public katalog <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
          >
            Narxlar va access
          </Link>
        </div>
      </div>

      {actionMessage ? (
        <div
          className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${
            actionMessage.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
          }`}
        >
          {actionMessage.text}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Jami kurslar", value: courses.length },
          {
            label: "Jami o'quvchilar",
            value: totalStudents.toLocaleString(),
          },
          {
            label: "O'rtacha reyting",
            value: averageRating.toFixed(1),
          },
          {
            label: "Jami modullar",
            value: courses.reduce((s, c) => s + c.modules.length, 0),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-blue-900/30 dark:from-blue-950/20 dark:to-gray-950">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Python va Data Analytics Upload Center
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Shu ikki kurs uchun video slotlar va downloadable resurslar tayyor.
            MP4, WEBM yoki MOV fayllarni ko&apos;rsatilgan lesson ID bilan joylasangiz, learning
            room player avtomatik ishga tushadi.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {managedCourses.map((course) => (
            <section
              key={course.id}
              className="rounded-[1.5rem] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    {course.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {course.uploadedLessons.length}/{course.uploadReadyLessons.length} video
                    slot tayyor, {course.downloadableResources} ta real resurs ulangan
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
                  >
                    Kurs sahifasi
                  </Link>
                  <Link
                    href={`/courses/${course.id}/watch`}
                    className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Learning room
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                  <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {course.uploadReadyLessons.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    upload slot
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                  <UploadCloud className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {course.uploadedLessons.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    topilgan video
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                  <FileText className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {course.downloadableResources}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    real resurs
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                  <PlayCircle className="h-4 w-4 text-amber-500" />
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {getCoursePreviewLessons(course).length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    preview lesson
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {course.uploadReadyLessons.slice(0, 4).map((lesson) => {
                  const uploaded = lesson.isUploaded;

                  return (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {lesson.id} • {lesson.duration} • {lesson.resources.length} resurs
                          </p>
                          <p className="mt-2 font-mono text-[11px] leading-5 text-gray-500 dark:text-gray-400">
                            {lesson.uploadFilePath}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            uploaded
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                          }`}
                        >
                          {uploaded ? "Yuklangan" : "Kutilmoqda"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 md:col-span-2 xl:col-span-3">
            Hozir public katalogda aktiv kurs yo&apos;q. Admin content bootstrap yoki
            instructor review orqali kurslarni qayta publish qilish mumkin.
          </div>
        ) : null}

        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-start justify-between p-5 pb-3">
              <div className="min-w-0 flex-1">
                <span
                  className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    levelColors[course.level] ?? levelColors["Barcha daraja"]
                  }`}
                >
                  {course.level}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400">{course.instructor}</p>
              </div>
              <span className="ml-3 shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {course.category}
              </span>
            </div>

            <div className="flex items-center gap-4 px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.students.toLocaleString()} o&apos;quvchi
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                {course.rating}
              </span>
            </div>

            <form action={updateCourseBasics} className="space-y-3 px-5 pb-4">
              <input type="hidden" name="course_id" value={course.id} />

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Nomi
                <input
                  name="title"
                  defaultValue={course.title}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Subtitle
                <input
                  name="subtitle"
                  defaultValue={course.subtitle}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Narx
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={course.price}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Daraja
                  <input
                    name="level"
                    defaultValue={course.level}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Kategoriya
                  <input
                    name="category"
                    defaultValue={course.category}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Mentor
                  <input
                    name="instructor"
                    defaultValue={course.instructor}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Davomiylik
                  <input
                    name="duration"
                    defaultValue={course.duration}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Til
                  <input
                    name="language"
                    defaultValue={course.language}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Pace
                <input
                  name="pace"
                  defaultValue={course.pace}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Description
                <textarea
                  name="description"
                  defaultValue={course.description}
                  rows={4}
                  className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition-colors focus:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {(course.price / 1000).toFixed(0)}K so&apos;m
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800"
                >
                  <Save className="h-3.5 w-3.5" />
                  Saqlash
                </button>
              </div>
            </form>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 px-5 py-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/courses/${course.id}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Batafsil
                </Link>
                <Link
                  href={`/courses/${course.id}/watch`}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Preview
                </Link>
              </div>

              <form action={archiveCourse}>
                <input type="hidden" name="course_id" value={course.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                >
                  <Archive className="h-3.5 w-3.5" />
                  O&apos;chirish
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
