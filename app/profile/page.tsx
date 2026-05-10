import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle,
  Clock,
  Flame,
  Mail,
  Phone,
  BriefcaseBusiness,
  Settings,
  Shield,
  Star,
  Trophy,
  User,
} from "lucide-react";
import Footer from "@/components/Footer";
import {
  buildLearnerAchievements,
  getNextAchievement,
} from "@/lib/learner-achievements";
import { createClient } from "@/utils/supabase/server";
import ProfileForm from "./ProfileForm";

async function getProfileData(userId: string) {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: enrollments },
    { data: certificates },
    { data: sessions },
    { data: quizAttempts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, phone, bio, company_name, role, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("enrollments")
      .select("progress_percent, completed_at")
      .eq("user_id", userId),
    supabase.from("certificates").select("course_id").eq("user_id", userId),
    supabase
      .from("learning_sessions")
      .select("duration_minutes, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("quiz_attempts").select("percent, passed").eq("user_id", userId),
  ]);

  const totalMinutes =
    sessions?.reduce((sum, session) => sum + (session.duration_minutes ?? 0), 0) ?? 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const learningTime =
    totalMinutes === 0
      ? "0 soat"
      : totalHours > 0
        ? `${totalHours} soat ${remainingMinutes} min`
        : `${remainingMinutes} min`;

  const activeCount = enrollments?.filter((enrollment) => !enrollment.completed_at).length ?? 0;
  const completedCount =
    enrollments?.filter((enrollment) => enrollment.completed_at).length ?? 0;
  const passedQuizzes = quizAttempts?.filter((attempt) => attempt.passed).length ?? 0;
  const avgScore =
    quizAttempts && quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, attempt) => sum + attempt.percent, 0) /
            quizAttempts.length
        )
      : 0;

  function calcStreak() {
    if (!sessions || sessions.length === 0) {
      return 0;
    }

    const days = new Set(
      sessions.map((session) => {
        const date = new Date(session.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;

    while (days.has(today.getTime() - streak * 24 * 60 * 60 * 1000)) {
      streak += 1;
    }

    return streak;
  }

  const streak = calcStreak();
  const certCount = certificates?.length ?? 0;
  const sessionCount = sessions?.length ?? 0;
  const achievements = buildLearnerAchievements({
    sessionCount,
    certCount,
    streak,
    passedQuizzes,
    totalHours,
    completedCount,
  });

  return {
    profile,
    certCount,
    activeCount,
    completedCount,
    learningTime,
    streak,
    passedQuizzes,
    avgScore,
    achievements,
    totalQuizAttempts: quizAttempts?.length ?? 0,
    totalHours,
    sessionCount,
  };
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    profile,
    certCount,
    activeCount,
    completedCount,
    learningTime,
    streak,
    passedQuizzes,
    avgScore,
    achievements,
    totalQuizAttempts,
    totalHours,
    sessionCount,
  } = await getProfileData(user.id);

  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "Foydalanuvchi";
  const initials = displayName
    .split(" ")
    .map((word: string) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const nextAchievement = getNextAchievement({
    sessionCount,
    certCount,
    streak,
    passedQuizzes,
    totalHours,
    completedCount,
  });

  const stats = [
    {
      label: "Faol kurslar",
      value: activeCount.toString(),
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "O'rganish vaqti",
      value: learningTime,
      icon: Clock,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Sertifikatlar",
      value: certCount.toString(),
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Tugatilgan",
      value: completedCount.toString(),
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Quiz o'tildi",
      value: passedQuizzes.toString(),
      icon: Star,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Streak",
      value: `${streak} kun`,
      icon: Flame,
      color: streak >= 3 ? "text-orange-500" : "text-gray-400",
      bg:
        streak >= 3
          ? "bg-orange-50 dark:bg-orange-950/30"
          : "bg-gray-50 dark:bg-gray-900",
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-gray-50/50 p-4 dark:bg-black md:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
            >
              <Settings className="h-3.5 w-3.5" /> Sozlamalar
            </Link>
            {(profile?.role === "instructor" || profile?.role === "admin") && (
              <Link
                href="/instructor"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-950/20"
              >
                <BriefcaseBusiness className="h-3.5 w-3.5" /> Instructor Studio
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-black text-white shadow-lg">
                  {initials || <User className="h-8 w-8" />}
                </div>
                {streak >= 3 && (
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 shadow">
                    <Flame className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                    {displayName}
                  </h1>
                  {profile?.role === "admin" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                  {profile?.role === "instructor" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <BriefcaseBusiness className="h-3 w-3" /> Instructor
                    </span>
                  )}
                  {profile?.company_name && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                      <Building2 className="h-3 w-3" /> {profile.company_name}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  )}
                  {joinedAt && <span className="text-xs">{joinedAt} dan a&apos;zo</span>}
                </div>
                {profile?.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className={`mb-2 inline-flex rounded-xl p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {totalQuizAttempts > 0 && (
            <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:border-purple-900/30 dark:from-purple-950/20 dark:to-indigo-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                    Quiz natijalari
                  </h3>
                  <p className="mt-0.5 text-xs text-purple-700/70 dark:text-purple-400">
                    {totalQuizAttempts} ta urinish | {passedQuizzes} ta o'tildi
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-purple-700 dark:text-purple-300">
                    {avgScore}%
                  </p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400">
                    o'rtacha ball
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-200/50 dark:bg-purple-900/30">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all"
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
              Yutuqlar
            </h2>
            {nextAchievement && (
              <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Keyingi milestone
                </p>
                <p className="mt-2 font-semibold text-blue-900 dark:text-blue-200">
                  {nextAchievement.label}
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  {nextAchievement.progress}/{nextAchievement.target} progress
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                    achievement.earned
                      ? "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20"
                      : "border-gray-100 bg-gray-50 opacity-40 dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {achievement.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {achievement.description}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-gray-400">
                      {Math.min(achievement.progress, achievement.target)}/
                      {achievement.target}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
              Profilni tahrirlash
            </h2>
            <div className="mb-5 space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={user.email ?? ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500"
              />
              <p className="text-xs text-gray-400">Email o&apos;zgartirilmaydi</p>
            </div>
            <ProfileForm fullName={profile?.full_name ?? displayName} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
