import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock3,
  Files,
  Globe2,
  GraduationCap,
  Lock,
  PlayCircle,
  Sparkles,
  Star,
  Users2,
} from "lucide-react";
import CourseWishlistButton from "@/components/CourseWishlistButton";
import {
  getCourseExperienceMeta,
  getCourseCareerOutcomes,
  getCourseFaqs,
  getCourseWeeklyPlan,
  getCourseTracks,
  getMasteryLevel,
} from "@/lib/course-experience";
import { getQuizByCourseId } from "@/lib/quizzes";
import { createClient } from "@/utils/supabase/server";
import {
  getCourseById,
  getCourseLessonCount,
  getCoursePreviewLessons,
  getCourseResourceCount,
} from "@/lib/catalog";

interface CourseDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrollment: {
    progress_percent: number | null;
    enrolled_at: string | null;
    completed_at: string | null;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("progress_percent, enrolled_at, completed_at")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    enrollment = data;
  }

  const lessonCount = getCourseLessonCount(course);
  const resourceCount = getCourseResourceCount(course);
  const previewLessons = getCoursePreviewLessons(course);
  const firstPreviewLesson = previewLessons[0];
  const isEnrolled = Boolean(enrollment);
  const experienceMeta = getCourseExperienceMeta(course);
  const tracks = getCourseTracks(course);
  const faqs = getCourseFaqs(course);
  const weeklyPlan = getCourseWeeklyPlan(course);
  const careerOutcomes = getCourseCareerOutcomes(course);
  const mastery = enrollment
    ? getMasteryLevel(enrollment.progress_percent ?? 0)
    : null;
  const courseQuiz = getQuizByCourseId(course.id);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_45%,#000000_100%)]">
      <section className="border-b border-gray-200/70 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          <Link
            href="/courses"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Barcha kurslarga qaytish
          </Link>

          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <div
                className={`overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br ${course.heroGradient} p-8 text-white shadow-2xl shadow-blue-500/10`}
              >
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    {course.category}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    {course.level}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    {course.language}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                    {previewLessons.length} ta preview dars
                  </span>
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                  {course.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
                  {course.subtitle}
                </p>
                {experienceMeta && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {experienceMeta.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/85"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-white/75">
                      <Star className="h-4 w-4 text-amber-300" />
                      <span className="text-xs uppercase tracking-[0.16em]">
                        Reyting
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-black">{course.rating}</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-white/75">
                      <Users2 className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.16em]">
                        O&apos;quvchilar
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-black">
                      {course.students.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-white/75">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.16em]">
                        Darslar
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-black">{lessonCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-white/75">
                      <Files className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.16em]">
                        Resurslar
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-black">{resourceCount}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-4 w-4" /> Kurs haqida
                  </div>
                  <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-400">
                    {course.description}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Clock3 className="h-4 w-4 text-blue-500" /> Davomiylik
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {course.duration} | {course.pace}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Globe2 className="h-4 w-4 text-emerald-500" /> Til va format
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {course.language} | video darslar | resurslar | mentor support
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Bu kursda sizni nima kutadi
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    {course.supportItems.map((item) => (
                      <li key={item.title} className="flex items-start gap-3">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {experienceMeta && (
                <section className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <h2 className="text-lg font-black text-gray-950 dark:text-white">
                      Siz rivojlantiradigan ko&apos;nikmalar
                    </h2>
                    <ul className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      {experienceMeta.skills.map((skill) => (
                        <li key={skill} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <h2 className="text-lg font-black text-gray-950 dark:text-white">
                      Boshlashdan oldin
                    </h2>
                    <ul className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      {experienceMeta.prerequisites.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <h2 className="text-lg font-black text-gray-950 dark:text-white">
                      Kurs kimlar uchun
                    </h2>
                    <ul className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      {experienceMeta.targetAudience.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Users2 className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              <section className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                  Kurs yakunida nimalarni qila olasiz
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
                          {outcome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                    Tavsiya etilgan study plan
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Kursni tartibli o&apos;tish uchun haftalik fokus bloklari.
                  </p>
                  <div className="mt-6 space-y-4">
                    {weeklyPlan.map((item) => (
                      <div
                        key={item.week}
                        className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-bold text-gray-950 dark:text-white">
                            {item.focus}
                          </p>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                            {item.week}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                          {item.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <h2 className="text-xl font-black text-gray-950 dark:text-white">
                      Kursdan keyingi qo&apos;llanish
                    </h2>
                    <div className="mt-5 space-y-4">
                      {careerOutcomes.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                        >
                          <p className="font-semibold text-gray-950 dark:text-white">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {courseQuiz && (
                    <div className="rounded-[2rem] border border-purple-200 bg-purple-50 p-6 shadow-sm dark:border-purple-900/30 dark:bg-purple-950/20">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">
                        Mastery challenge
                      </p>
                      <h3 className="mt-3 text-xl font-black text-gray-950 dark:text-white">
                        Practice test va challenge mode
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        Premium access ichida quiz practice va timed challenge rejimlari ochiladi.
                        Bu modul kurs bo&apos;yicha mastery signalini kuchaytiradi.
                      </p>
                      <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-purple-700 dark:bg-black/20 dark:text-purple-300">
                        O&apos;tish bali: {courseQuiz.passingScore}% | Savollar: {courseQuiz.questions.length} ta
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                      Learning track&apos;lar
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Audit preview va certificate track bir sahifada boshqariladi.
                    </p>
                  </div>
                  {experienceMeta && (
                    <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      {experienceMeta.certificate.title}
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {tracks.map((track) => (
                    <div
                      key={track.title}
                      className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {track.subtitle}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">
                        {track.title}
                      </h3>
                      <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        {track.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section
                id="curriculum"
                className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                      Kurs dasturi
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {course.modules.length} ta modul | {lessonCount} ta dars | {resourceCount} ta qo&apos;shimcha resurs
                    </p>
                  </div>
                  {firstPreviewLesson && (
                    <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      Birinchi {previewLessons.length} dars bepul ochiq
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <div
                      key={module.id}
                      className="overflow-hidden rounded-[1.5rem] border border-gray-200 dark:border-gray-800"
                    >
                      <div className="bg-gray-50 px-5 py-4 dark:bg-gray-900">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-bold text-gray-950 dark:text-white">
                              {moduleIndex + 1}. {module.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {module.description}
                            </p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                            {module.lessons.length} lesson
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="flex items-start gap-3">
                              {lesson.isFree ? (
                                <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                              ) : (
                                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-400">
                              <span>{lesson.duration}</span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-900">
                                {lesson.isFree ? "Preview" : "Premium"}
                              </span>
                              {lesson.isFree ? (
                                <Link
                                  href={`/courses/${course.id}/watch?lesson=${lesson.id}`}
                                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                                >
                                  Ko&apos;rish
                                </Link>
                              ) : isEnrolled ? (
                                <Link
                                  href={`/courses/${course.id}/watch?lesson=${lesson.id}`}
                                  className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                                >
                                  Ochish
                                </Link>
                              ) : (
                                <Link
                                  href={`/checkout?type=course&id=${course.id}`}
                                  className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                                >
                                  To&apos;liq access
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                  O&apos;quvchi fikrlari
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {course.reviews.map((review) => (
                    <div
                      key={`${review.name}-${review.role}`}
                      className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-950 dark:text-white">
                            {review.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {review.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-semibold">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        &quot;{review.quote}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                  Tez-tez so&apos;raladigan savollar
                </h2>
                <div className="mt-6 space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <h3 className="text-base font-bold text-gray-950 dark:text-white">
                        {faq.question}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="xl:sticky xl:top-24 xl:h-fit">
              <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
                <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {course.instructor}
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-4xl font-black text-gray-950 dark:text-white">
                      {course.price.toLocaleString()}
                    </span>
                    <span className="pb-1 text-sm text-gray-500 dark:text-gray-400">
                      UZS
                    </span>
                  </div>

                  <div className="mt-5">
                    <CourseWishlistButton
                      courseId={course.id}
                      variant="inline"
                      className="w-full justify-center"
                    />
                  </div>

                  {isEnrolled ? (
                    <div className="mt-6 space-y-3">
                      <Link
                        href={`/courses/${course.id}/watch`}
                        className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Kursga kirish
                      </Link>
                      <Link
                        href="/dashboard"
                        className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        Dashboard&apos;ga o&apos;tish
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {firstPreviewLesson && (
                        <Link
                          href={`/courses/${course.id}/watch?lesson=${firstPreviewLesson.id}`}
                          className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          3 ta bepul darsni boshlash
                        </Link>
                      )}
                      <Link
                        href={`/checkout?type=course&id=${course.id}`}
                        className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        To&apos;liq kursni ochish
                      </Link>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-6 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <span>{course.level} darajadagi o&apos;quvchilar uchun</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-500" />
                    <span>
                      {course.duration} | {course.pace} formatida
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Files className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>Har dars uchun resurs, checklist va qo&apos;llanma</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <span>Mentor support, premium lessonlar va yakuniy roadmap bir product ichida ulanadi</span>
                  </div>
                  {!isEnrolled && (
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
                      Birinchi {previewLessons.length} dars bepul ochiq. Qolgan premium lessonlar to&apos;lov tasdiqlangach darhol ochiladi.
                    </div>
                  )}
                </div>

                {enrollment && (
                  <div className="border-t border-gray-100 bg-blue-50/70 p-6 dark:border-gray-800 dark:bg-blue-950/20">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                      Enrollment holati
                    </p>
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                      Siz ushbu kursga yozilgansiz. Progress:{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {enrollment.progress_percent ?? 0}%
                      </span>
                    </p>
                    {mastery && (
                      <div className="mt-4 rounded-2xl border border-white/40 bg-white/80 p-4 dark:border-blue-900/30 dark:bg-black/20">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Mastery status
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${mastery.className}`}
                          >
                            {mastery.label}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                          {mastery.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

