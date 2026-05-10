import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  CheckCircle,
  Clock,
  Flame,
  PlayCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";
import CourseWishlistButton from "@/components/CourseWishlistButton";
import { getCoursesData } from "@/lib/content-store";
import { getMasteryLevel } from "@/lib/course-experience";
import {
  buildLearnerAchievements,
  getNextAchievement,
} from "@/lib/learner-achievements";
import { getStudentReputation } from "@/lib/server/student-reputation";
import { createClient } from "@/utils/supabase/server";

interface DashboardProfile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface DashboardEnrollmentRow {
  course_id: string;
  progress_percent: number | null;
  last_accessed_at: string | null;
  completed_at: string | null;
  enrolled_at: string | null;
}

interface DashboardSessionRow {
  duration_minutes: number | null;
  created_at: string;
}

interface DashboardQuizAttemptRow {
  percent: number;
  passed: boolean;
}

interface DashboardCertificateRow {
  course_id: string;
  issued_at: string;
  certificate_no?: string | null;
}

function formatLearningTime(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return "0 soat";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} soat`;
  }

  return `${hours} soat ${minutes} min`;
}

function calculateStreak(sessions: DashboardSessionRow[]) {
  if (sessions.length === 0) {
    return 0;
  }

  const activeDays = new Set(
    sessions.map((session) => {
      const date = new Date(session.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;

  while (activeDays.has(today.getTime() - streak * 24 * 60 * 60 * 1000)) {
    streak += 1;
  }

  return streak;
}

function isWishlistTableMissing(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("wishlist_courses") || message.includes("could not find");
}

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: enrollments },
    { data: certificates },
    { data: sessions },
    { data: quizAttempts },
    wishlistResult,
    reputation,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", userId)
      .single(),
    supabase
      .from("enrollments")
      .select("course_id, progress_percent, last_accessed_at, completed_at, enrolled_at")
      .eq("user_id", userId)
      .order("last_accessed_at", { ascending: false }),
    supabase
      .from("certificates")
      .select("course_id, issued_at, certificate_no")
      .eq("user_id", userId),
    supabase
      .from("learning_sessions")
      .select("duration_minutes, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("quiz_attempts").select("percent, passed").eq("user_id", userId),
    supabase
      .from("wishlist_courses")
      .select("course_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    getStudentReputation(userId, supabase),
  ]);

  const safeSessions = (sessions ?? []) as DashboardSessionRow[];
  const totalMinutes = safeSessions.reduce(
    (sum, row) => sum + (row.duration_minutes ?? 0),
    0
  );
  const safeQuizAttempts = (quizAttempts ?? []) as DashboardQuizAttemptRow[];
  const passedQuizzes = safeQuizAttempts.filter((attempt) => attempt.passed).length;
  const avgQuizScore =
    safeQuizAttempts.length > 0
      ? Math.round(
          safeQuizAttempts.reduce((sum, attempt) => sum + attempt.percent, 0) /
            safeQuizAttempts.length
        )
      : null;

  const wishlistCourseIds = isWishlistTableMissing(wishlistResult.error)
    ? []
    : (wishlistResult.data ?? []).map((item) => item.course_id);

  return {
    profile: profile as DashboardProfile | null,
    enrollments: (enrollments ?? []) as DashboardEnrollmentRow[],
    certificates: (certificates ?? []) as DashboardCertificateRow[],
    certCount: certificates?.length ?? 0,
    learningTime: formatLearningTime(totalMinutes),
    totalHours: Math.floor(totalMinutes / 60),
    sessionCount: safeSessions.length,
    streak: calculateStreak(safeSessions),
    passedQuizzes,
    avgQuizScore,
    wishlistCourseIds,
    reputation,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const courses = await getCoursesData();
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    profile,
    enrollments,
    certCount,
    certificates,
    learningTime,
    totalHours,
    sessionCount,
    streak,
    passedQuizzes,
    avgQuizScore,
    wishlistCourseIds,
    reputation,
  } = await getDashboardData(user.id);

  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "Foydalanuvchi";

  const activeEnrollments = enrollments
    .filter((enrollment) => !enrollment.completed_at)
    .map((enrollment) => {
      const course = coursesById.get(enrollment.course_id);

      if (!course) {
        return null;
      }

      return {
        ...enrollment,
        course,
        mastery: getMasteryLevel(enrollment.progress_percent ?? 0),
      };
    })
    .filter((enrollment) => Boolean(enrollment));
  const completedEnrollments = enrollments
    .filter((enrollment) => enrollment.completed_at)
    .map((enrollment) => {
      const course = coursesById.get(enrollment.course_id);

      if (!course) {
        return null;
      }

      return {
        ...enrollment,
        course,
        certificate: certificates.find(
          (certificate) => certificate.course_id === enrollment.course_id
        ),
      };
    })
    .filter((enrollment) => Boolean(enrollment));

  const completedCount = enrollments.filter((enrollment) => enrollment.completed_at).length;
  const achievements = buildLearnerAchievements({
    sessionCount,
    certCount,
    streak,
    passedQuizzes,
    totalHours,
    completedCount,
  });
  const nextAchievement = getNextAchievement({
    sessionCount,
    certCount,
    streak,
    passedQuizzes,
    totalHours,
    completedCount,
  });
  const enrolledIds = new Set(enrollments.map((enrollment) => enrollment.course_id));
  const suggestedCourses = courses
    .filter((course) => !enrolledIds.has(course.id))
    .slice(0, 2);
  const savedCourses = wishlistCourseIds
    .map((courseId) => coursesById.get(courseId))
    .filter((course) => Boolean(course))
    .slice(0, 3);

  const stats = [
    {
      label: "Faol kurslar",
      value: activeEnrollments.length.toString(),
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      label: "O'rganish vaqti",
      value: learningTime,
      icon: Clock,
      color: "text-emerald-500",
    },
    {
      label: "Sertifikatlar",
      value: certCount.toString(),
      icon: Trophy,
      color: "text-amber-500",
    },
    {
      label: "Yakunlangan kurslar",
      value: completedCount.toString(),
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: streak > 0 ? "Learning streak" : "Streak",
      value: streak > 0 ? `${streak} kun` : "Hali yo'q",
      icon: Flame,
      color: streak > 0 ? "text-orange-500" : "text-gray-400",
    },
    {
      label: avgQuizScore !== null ? "Quiz o'rtachasi" : "Quiz natijalari",
      value:
        avgQuizScore !== null
          ? `${avgQuizScore}%`
          : passedQuizzes > 0
            ? `${passedQuizzes} ta passed`
            : "Hali yo'q",
      icon: Star,
      color: "text-purple-500",
    },
    {
      label: "Credit score",
      value: reputation.backendReady ? reputation.creditScore.toString() : "Setup",
      icon: ShieldCheck,
      color:
        reputation.creditScore >= 80
          ? "text-emerald-500"
          : reputation.creditScore >= 60
            ? "text-amber-500"
            : "text-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 md:p-8 dark:bg-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Xush kelibsiz, {displayName}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Bugungi learning sprint uchun davom ettirish, saqlangan kurslar va challenge
              track shu yerda jamlangan.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            Yangi kurslar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                  Oflayn davomat tizimi
                </h3>
                <p className="text-sm text-blue-700/70 dark:text-blue-400">
                  Markazga kelganingizda QR chiptangiz bilan kirish qiling.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/attendance"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <QrCode className="h-4 w-4" /> QR chiptani ko&apos;rish
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Davom ettirish
              </h2>
              {activeEnrollments.length > 0 && (
                <Link
                  href="/courses"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Barcha kurslarni ko&apos;rish
                </Link>
              )}
            </div>

            {activeEnrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-950">
                <BookOpen className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Hali birorta kursga yozilmagansiz
                </p>
                <Link
                  href="/courses"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Kurslarni ko&apos;rish <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeEnrollments.map((enrollment) => (
                  <Link
                    key={enrollment!.course.id}
                    href={`/courses/${enrollment!.course.id}/watch`}
                    className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:flex-row dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div
                      className={`flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${enrollment!.course.heroGradient} sm:w-44`}
                    >
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex w-full flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {enrollment!.course.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${enrollment!.mastery.className}`}
                        >
                          {enrollment!.mastery.label}
                        </span>
                      </div>
                      <h3 className="mt-2 font-bold text-gray-900 dark:text-white">
                        {enrollment!.course.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {enrollment!.course.instructor}
                        {enrollment!.last_accessed_at && (
                          <span className="ml-2 text-xs text-gray-400">
                            {new Date(enrollment!.last_accessed_at).toLocaleDateString("uz-UZ")}
                          </span>
                        )}
                      </p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {enrollment!.mastery.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all"
                            style={{ width: `${enrollment!.progress_percent ?? 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {enrollment!.progress_percent ?? 0}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {savedCourses.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-amber-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Saqlangan kurslar
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {savedCourses.map((course) => (
                    <div
                      key={course!.id}
                      className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {course!.category}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                        {course!.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
                        {course!.subtitle}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <Link
                          href={`/courses/${course!.id}`}
                          className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Kursni ochish
                        </Link>
                        <CourseWishlistButton courseId={course!.id} variant="compact" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {completedEnrollments.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sertifikatlar
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {completedEnrollments.map((enrollment) => (
                    <Link
                      key={enrollment!.course.id}
                      href={`/certificates/${enrollment!.course.id}`}
                      className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-amber-900/30 dark:bg-gray-950"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                        Certificate track
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                        {enrollment!.course.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {enrollment!.certificate?.certificate_no
                          ? `No: ${enrollment!.certificate.certificate_no}`
                          : "Certificate raqami ochilganda avtomatik yaratiladi"}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Achievement progress
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {achievement.label}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          achievement.earned
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {achievement.earned
                          ? "Unlocked"
                          : `${Math.min(achievement.progress, achievement.target)}/${achievement.target}`}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
                      {achievement.description}
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((achievement.progress / achievement.target) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {suggestedCourses.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Sizga tavsiya etiladi
                  </h3>
                </div>
                {suggestedCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {course.duration} | {course.level}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 text-sm font-bold text-gray-900 dark:text-white">
                      {(course.price / 1000).toFixed(0)}K so&apos;m
                    </span>
                  </Link>
                ))}
              </section>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Mentor</h2>
            <div className="rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50 to-white p-6 shadow-sm dark:border-purple-900/30 dark:from-purple-950/20 dark:to-gray-950">
              <Sparkles className="mb-4 h-8 w-8 text-purple-500" />
              {activeEnrollments.length > 0 ? (
                <>
                  <p className="mb-4 text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                    {activeEnrollments[0]!.course.title} kursida{" "}
                    {activeEnrollments[0]!.progress_percent ?? 0}% progress qayd etilgan. Shu
                    sprintda mastery track&apos;ni bir pog&apos;ona yuqoriga olib chiqing.
                  </p>
                  <Link
                    href={`/courses/${activeEnrollments[0]!.course.id}/watch`}
                    className="block w-full rounded-xl bg-purple-600 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-purple-700"
                  >
                    Darsni davom ettirish
                  </Link>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                    Biror kursni boshlaganingizdan keyin AI Mentor sizga lesson, quiz va next-step
                    bo&apos;yicha tavsiyalar bera boshlaydi.
                  </p>
                  <Link
                    href="/courses"
                    className="block w-full rounded-xl bg-purple-600 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-purple-700"
                  >
                    Kursni boshlash
                  </Link>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                    Student credit score:{" "}
                    {reputation.backendReady ? reputation.creditScore : 100}
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300">
                    Discussion qoidalari buzilsa score kamayadi
                    {reputation.pricingPenaltyPercent > 0
                      ? ` va keyingi kurs narxiga +${reputation.pricingPenaltyPercent}% risk bor`
                      : "."}
                  </p>
                </div>
              </div>
            </div>

            {nextAchievement && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      Keyingi milestone: {nextAchievement.label}
                    </p>
                    <p className="text-xs text-blue-700/70 dark:text-blue-400">
                      {nextAchievement.progress}/{nextAchievement.target} progress
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-blue-700 dark:text-blue-300">
                  {nextAchievement.description}
                </p>
              </div>
            )}

            {avgQuizScore !== null && (
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 dark:border-purple-900/30 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-purple-500" />
                  <div>
                    <p className="font-semibold text-purple-900 dark:text-purple-300">
                      {passedQuizzes} ta quiz muvaffaqiyatli topshirilgan
                    </p>
                    <p className="text-xs text-purple-700/70 dark:text-purple-400">
                      O&apos;rtacha natija: {avgQuizScore}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {certCount > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-300">
                      {certCount} ta sertifikat
                    </p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-400">
                      Certificate track muvaffaqiyatli yakunlangan kurslar
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/leaderboard"
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-amber-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-amber-700/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Reyting jadvali
                </p>
                <p className="text-xs text-gray-400">Top o&apos;quvchilarni ko&apos;ring</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
