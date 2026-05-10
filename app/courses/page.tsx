import Link from "next/link";
import CoursesCatalog from "@/components/CoursesCatalog";
import SavedCoursesShelf from "@/components/SavedCoursesShelf";
import {
  getCourseLessonCount,
  getCoursePreviewLessons,
  getCourseResourceCount,
} from "@/lib/catalog";
import { getCoursesData } from "@/lib/content-store";
import { BookOpen, Files, Sparkles, Star, Users2 } from "lucide-react";

export default async function CoursesPage() {
  const courses = await getCoursesData();
  const totalLessons = courses.reduce(
    (sum, course) => sum + getCourseLessonCount(course),
    0
  );
  const totalResources = courses.reduce(
    (sum, course) => sum + getCourseResourceCount(course),
    0
  );
  const totalPreviewLessons = courses.reduce(
    (sum, course) => sum + getCoursePreviewLessons(course).length,
    0
  );
  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);
  const averageRating = (
    courses.reduce((sum, course) => sum + course.rating, 0) / courses.length
  ).toFixed(1);
  const featuredCourse = courses[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fafc_50%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_35%),linear-gradient(180deg,#020617_0%,#020617_60%,#000000_100%)]">
      <section className="border-b border-gray-200/70 dark:border-gray-800">
        <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-end">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <Sparkles className="h-4 w-4" /> Premium learning ecosystem
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white md:text-6xl">
                  Data va finance yo&apos;nalishlari uchun premium, strukturalangan kurslar
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
                  Python, SQL, database, AI, Power BI, data analytics, data science va ACCA IFRS yo&apos;nalishlari Udemy uslubidagi curriculum, preview darslar va to&apos;lovdan keyin ochiladigan premium lesson flow bilan tayyor.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
                  <BookOpen className="mb-3 h-5 w-5 text-blue-600" />
                  <p className="text-2xl font-black text-gray-950 dark:text-white">
                    {courses.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ta flagship kurs
                  </p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
                  <Users2 className="mb-3 h-5 w-5 text-fuchsia-600" />
                  <p className="text-2xl font-black text-gray-950 dark:text-white">
                    {totalStudents.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    faol o&apos;quvchi
                  </p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
                  <Files className="mb-3 h-5 w-5 text-emerald-600" />
                  <p className="text-2xl font-black text-gray-950 dark:text-white">
                    {totalLessons} / {totalResources}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    dars va resurslar
                  </p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
                  <Star className="mb-3 h-5 w-5 text-amber-500" />
                  <p className="text-2xl font-black text-gray-950 dark:text-white">
                    {totalPreviewLessons}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    bepul preview dars
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white/80 shadow-xl shadow-blue-500/10 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
              <div
                className={`bg-gradient-to-br ${featuredCourse.heroGradient} p-8 text-white`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Featured track
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  {featuredCourse.title}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/85">
                  {featuredCourse.subtitle}
                </p>
              </div>
              <div className="space-y-5 p-8">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{featuredCourse.instructor}</span>
                  <span>{featuredCourse.duration} | {averageRating} reyting</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  {featuredCourse.outcomes.slice(0, 3).map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/courses/${featuredCourse.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  Batafsil ko&apos;rish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="space-y-8">
          <SavedCoursesShelf courses={courses} />
          <CoursesCatalog courses={courses} />
        </div>
      </section>
    </main>
  );
}
