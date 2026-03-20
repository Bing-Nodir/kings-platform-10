import { redirect } from "next/navigation";
import {
  Award,
  BookOpen,
  Clock,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import Footer from "@/components/Footer";
import { calculateLearnerScore } from "@/lib/learner-achievements";
import { createClient } from "@/utils/supabase/server";

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  initials: string;
  totalHours: number;
  completedCourses: number;
  passedQuizzes: number;
  avgQuizScore: number;
  streak: number;
  score: number;
}

function calcStreak(sessions: Array<{ created_at: string }>) {
  if (sessions.length === 0) {
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

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();

  const [
    { data: profiles },
    { data: enrollments },
    { data: sessions },
    { data: quizAttempts },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").limit(50),
    supabase.from("enrollments").select("user_id, completed_at"),
    supabase
      .from("learning_sessions")
      .select("user_id, duration_minutes, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("quiz_attempts").select("user_id, percent, passed"),
  ]);

  if (!profiles) {
    return [];
  }

  const sessionsByUser: Record<
    string,
    Array<{ duration_minutes: number | null; created_at: string }>
  > = {};
  sessions?.forEach((session) => {
    if (!sessionsByUser[session.user_id]) {
      sessionsByUser[session.user_id] = [];
    }

    sessionsByUser[session.user_id].push(session);
  });

  const enrollmentsByUser: Record<
    string,
    Array<{ user_id: string; completed_at: string | null }>
  > = {};
  enrollments?.forEach((enrollment) => {
    if (!enrollmentsByUser[enrollment.user_id]) {
      enrollmentsByUser[enrollment.user_id] = [];
    }

    enrollmentsByUser[enrollment.user_id].push(enrollment);
  });

  const quizByUser: Record<
    string,
    Array<{ user_id: string; percent: number; passed: boolean }>
  > = {};
  quizAttempts?.forEach((attempt) => {
    if (!quizByUser[attempt.user_id]) {
      quizByUser[attempt.user_id] = [];
    }

    quizByUser[attempt.user_id].push(attempt);
  });

  return profiles
    .map((profile) => {
      const userSessions = sessionsByUser[profile.id] ?? [];
      const userEnrollments = enrollmentsByUser[profile.id] ?? [];
      const userQuizzes = quizByUser[profile.id] ?? [];

      const totalMinutes = userSessions.reduce(
        (sum, session) => sum + (session.duration_minutes ?? 0),
        0
      );
      const totalHours = Math.round(totalMinutes / 60);
      const completedCourses = userEnrollments.filter(
        (enrollment) => enrollment.completed_at
      ).length;
      const passedQuizzes = userQuizzes.filter((quiz) => quiz.passed).length;
      const avgQuizScore =
        userQuizzes.length > 0
          ? Math.round(
              userQuizzes.reduce((sum, quiz) => sum + quiz.percent, 0) /
                userQuizzes.length
            )
          : 0;
      const streak = calcStreak(userSessions);
      const score = calculateLearnerScore({
        totalHours,
        completedCount: completedCourses,
        passedQuizzes,
        streak,
        avgQuizScore,
      });

      const displayName =
        profile.full_name ?? profile.email?.split("@")[0] ?? "Foydalanuvchi";
      const initials = displayName
        .split(" ")
        .map((word: string) => word[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        userId: profile.id,
        displayName,
        initials,
        totalHours,
        completedCourses,
        passedQuizzes,
        avgQuizScore,
        streak,
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 20);
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md">
        <Crown className="h-5 w-5 text-white" />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 shadow-md">
        <Medal className="h-5 w-5 text-white" />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-700 shadow-md">
        <Award className="h-5 w-5 text-white" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {rank}
    </div>
  );
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const entries = await getLeaderboardData();
  const currentUserRank = entries.findIndex((entry) => entry.userId === user.id) + 1;
  const currentUserEntry = entries.find((entry) => entry.userId === user.id);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50/80 to-white p-4 dark:from-black dark:to-gray-950 md:p-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700 shadow-sm dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
              <Trophy className="h-4 w-4" /> Top o&apos;quvchilar
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
              O&apos;rganish reytingi
            </h1>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Reyting: o&apos;rganish vaqti | tugatilgan kurslar | quiz natijalari | streak
            </p>
          </div>

          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[entries[1], entries[0], entries[2]].map((entry, index) => {
                const rank = index === 0 ? 2 : index === 1 ? 1 : 3;
                const isFirst = rank === 1;

                return (
                  <div
                    key={entry.userId}
                    className={`relative flex flex-col items-center rounded-2xl border p-4 text-center shadow-sm transition-all ${
                      isFirst
                        ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white dark:border-amber-800/40 dark:from-amber-950/30 dark:to-gray-950"
                        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                    }`}
                  >
                    {isFirst && (
                      <Sparkles className="absolute right-3 top-3 h-4 w-4 text-amber-400" />
                    )}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-black text-white shadow-lg ${
                        isFirst
                          ? "bg-gradient-to-br from-amber-400 to-orange-500"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      }`}
                    >
                      {entry.initials}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {isFirst ? (
                        <Crown className="h-4 w-4 text-amber-500" />
                      ) : rank === 2 ? (
                        <Medal className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Award className="h-4 w-4 text-amber-700" />
                      )}
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        #{rank}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">
                      {entry.displayName}
                    </p>
                    <p
                      className={`mt-1 text-xl font-black ${
                        isFirst
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {entry.score}
                    </p>
                    <p className="text-xs text-gray-400">ball</p>
                  </div>
                );
              })}
            </div>
          )}

          {currentUserEntry && currentUserRank > 3 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-800/40 dark:bg-blue-950/20">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Sizning o&apos;rningiz
              </p>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                  #{currentUserRank}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {currentUserEntry.initials}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {currentUserEntry.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentUserEntry.score} ball
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Top 20 o&apos;quvchilar
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Oxirgi yangilanish: har soatda
              </p>
            </div>

            {entries.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-200 dark:text-gray-700" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Hali reyting ma&apos;lumotlari yo&apos;q
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  O&apos;rganishni boshlang - reyting qurishning eng yaxshi vaqti hozir.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.userId === user.id;

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                        isCurrentUser
                          ? "bg-blue-50/60 dark:bg-blue-950/20"
                          : "hover:bg-gray-50/50 dark:hover:bg-gray-900/30"
                      }`}
                    >
                      <RankBadge rank={rank} />

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white">
                        {entry.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-gray-900 dark:text-white">
                            {entry.displayName}
                          </p>
                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              Siz
                            </span>
                          )}
                          {entry.streak >= 3 && (
                            <Flame
                              className="h-4 w-4 shrink-0 text-orange-500"
                              aria-label={`${entry.streak} kunlik streak`}
                            />
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                          {entry.totalHours > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {entry.totalHours} soat
                            </span>
                          )}
                          {entry.completedCourses > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {entry.completedCourses} kurs
                            </span>
                          )}
                          {entry.passedQuizzes > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" /> {entry.passedQuizzes} quiz
                            </span>
                          )}
                          {entry.streak > 0 && (
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" /> {entry.streak} kun
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                          {entry.score}
                        </p>
                        <p className="text-xs text-gray-400">ball</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ball hisoblash formulasi
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "1 soat o'rganish", value: "5 ball" },
                { label: "Kurs tugatish", value: "20 ball" },
                { label: "Quiz o'tish", value: "10 ball" },
                { label: "Streak (1 kun)", value: "3 ball" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-900"
                >
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
