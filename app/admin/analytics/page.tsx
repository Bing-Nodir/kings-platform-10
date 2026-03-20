import { courses } from "@/lib/catalog";
import { getAdminAnalyticsData } from "@/lib/server/metrics";
import {
  Activity,
  BookOpen,
  Brain,
  Clock,
  DollarSign,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const data = await getAdminAnalyticsData();

  const kpiCards = [
    { label: "Jami foydalanuvchilar", value: data.totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Jami daromad", value: `${(data.totalRevenue / 1_000_000).toFixed(2)}M so'm`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "O'rganish soatlari", value: `${data.totalHours}s`, icon: Clock, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
    { label: "Kurs tugallanish %", value: `${data.completionRate}%`, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Jami yozilishlar", value: data.totalEnrollments.toLocaleString(), icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    { label: "Quiz o'tish darajasi", value: `${data.quizPassRate}%`, icon: Brain, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
    { label: "Sertifikatlar", value: data.certCount.toLocaleString(), icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/30" },
    { label: "Quiz urinishlari", value: data.totalQuizAttempts.toLocaleString(), icon: Activity, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Platforma ishlash ko'rsatkichlari — real ma'lumotlar
        </p>
      </div>

      {/* KPI Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Course Performance Table */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Kurslar tahlili
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Yozilishlar, tugatilganlar va daromad
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/40">
                  {["Kurs nomi", "Yozilishlar", "Tugallanganlar", "Tugallanish %", "Daromad"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.courseStats.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{c.title}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      {c.enrollCount}
                    </td>
                    <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {c.completedCount}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${c.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {c.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      {c.revenue > 0 ? `${(c.revenue / 1_000_000).toFixed(1)}M` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Quiz natijalari (kurslar bo'yicha)</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Object.keys(data.quizByCourse).length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
                Hali quiz urinishlari yo'q
              </div>
            ) : (
              courses
                .filter((c) => data.quizByCourse[c.id])
                .map((c) => {
                  const qs = data.quizByCourse[c.id];
                  return (
                    <div key={c.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{c.title}</p>
                          <p className="text-xs text-gray-400">
                            {qs.attempts} urinish · {qs.passed} ta o'tdi
                          </p>
                        </div>
                        <span className={`shrink-0 text-sm font-bold ${qs.avgScore >= 70 ? "text-emerald-600" : qs.avgScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
                          {qs.avgScore}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full transition-all ${qs.avgScore >= 70 ? "bg-emerald-500" : qs.avgScore >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${qs.avgScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* New Users (last 7 days) */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Yangi a&apos;zolar (so&apos;ngi 7 kun)
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-2 h-32">
              {data.last7Days.map((day) => {
                const count = data.usersByDay[day] ?? 0;
                const max = Math.max(...data.last7Days.map((d) => data.usersByDay[d] ?? 0), 1);
                const heightPct = Math.round((count / max) * 100);
                const label = new Date(day).toLocaleDateString("uz-UZ", { weekday: "short" });
                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{count || ""}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-blue-500 transition-all dark:bg-blue-600"
                        style={{ height: `${heightPct}%`, minHeight: count > 0 ? "4px" : "0" }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
