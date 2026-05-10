import Link from "next/link";
import { BarChart3, Clock3, MessageSquare, TrendingUp, Users } from "lucide-react";
import { requireInstructorPage } from "@/lib/server/auth";
import { getInstructorWorkspaceData } from "@/lib/server/instructor-workspace";

function formatMoney(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString("uz-UZ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("uz-UZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function InstructorAnalyticsPage() {
  const { supabase, user } = await requireInstructorPage({
    loginRedirect: "/login?redirect=/instructor/analytics",
    fallbackRedirect: "/instructor",
  });
  const data = await getInstructorWorkspaceData(user.id, supabase);
  const maxRevenue = Math.max(...data.revenueSeries.map((item) => item.value), 1);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-10 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Performance intelligence
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Revenue, student engagement, completion va Q&A holati instructor
            qaror qabul qilishi uchun bitta joyda jamlangan.
          </p>
        </div>
        <Link
          href="/instructor/financial"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
        >
          <TrendingUp className="h-4 w-4" />
          Financials
        </Link>
      </div>

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {[
          {
            label: "Revenue",
            value: `${formatMoney(data.metrics.totalRevenue)} so'm`,
            icon: TrendingUp,
          },
          {
            label: "Students",
            value: data.metrics.totalStudents.toLocaleString("uz-UZ"),
            icon: Users,
          },
          {
            label: "Learning hours",
            value: data.metrics.totalLearningHours.toLocaleString("uz-UZ"),
            icon: Clock3,
          },
          {
            label: "Open Q&A",
            value: data.metrics.openQuestions.toLocaleString("uz-UZ"),
            icon: MessageSquare,
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <card.icon className="h-5 w-5 text-emerald-800" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)]">
        <div className="rounded-[2rem] border border-slate-200 bg-[#eef3ff] p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Revenue velocity
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                So'nggi 7 oy bo'yicha paid orderlar.
              </p>
            </div>
            <span className="rounded-lg bg-emerald-950 px-4 py-2 text-xs font-black text-white">
              MONTHLY
            </span>
          </div>
          <div className="flex h-72 items-end gap-6">
            {data.revenueSeries.map((month, index) => (
              <div key={month.key} className="flex h-full flex-1 flex-col justify-end gap-4">
                <div
                  className={`rounded-t-md ${
                    index === data.revenueSeries.length - 1
                      ? "bg-emerald-800"
                      : "bg-emerald-200"
                  }`}
                  style={{
                    height: `${Math.max(8, (month.value / maxRevenue) * 100)}%`,
                  }}
                />
                <span className="text-center text-[11px] font-black text-slate-500">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Learning pulse</h2>
          <div className="mt-5 space-y-4">
            {data.learningActivity.length === 0 ? (
              <p className="text-sm text-slate-500">Hali learning session yo'q.</p>
            ) : (
              data.learningActivity.slice(0, 6).map((activity) => (
                <div
                  key={`${activity.user_id}-${activity.course_id}-${activity.created_at}`}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="font-black text-slate-950">
                    {activity.studentName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activity.courseTitle}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    <span>{activity.duration_minutes ?? 0} min</span>
                    <span>{formatDate(activity.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-7 py-5">
          <BarChart3 className="h-5 w-5 text-emerald-800" />
          <h2 className="text-xl font-black text-slate-950">
            Course performance
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {data.courseCards.length === 0 ? (
            <div className="px-7 py-12 text-center text-sm text-slate-500">
              Hali published kurs yo'q.
            </div>
          ) : (
            data.courseCards.map((course) => (
              <article
                key={course.id}
                className="grid gap-5 px-7 py-5 lg:grid-cols-[minmax(0,1fr)_120px_120px_140px_140px]"
              >
                <div>
                  <p className="font-black text-slate-950">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {course.moduleCount} modul, {course.lessonCount} lesson
                  </p>
                </div>
                <p className="text-sm font-black text-slate-700">
                  {course.students} students
                </p>
                <p className="text-sm font-black text-slate-700">
                  {course.assets} assets
                </p>
                <p className="text-sm font-black text-emerald-900">
                  {formatMoney(course.revenue)} so'm
                </p>
                <Link
                  href="/instructor/submissions"
                  className="text-sm font-black text-emerald-900 hover:text-emerald-700"
                >
                  Manage
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
