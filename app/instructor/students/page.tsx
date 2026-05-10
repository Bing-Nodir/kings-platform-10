import Link from "next/link";
import { BookOpen, Clock3, GraduationCap, MessageSquare, Users } from "lucide-react";
import { requireInstructorPage } from "@/lib/server/auth";
import { getInstructorWorkspaceData } from "@/lib/server/instructor-workspace";

function formatMinutes(value: number) {
  if (value < 60) return `${value} min`;
  return `${Math.round((value / 60) * 10) / 10} soat`;
}

function formatDate(value: string | null) {
  if (!value) return "Hali aktiv emas";
  return new Date(value).toLocaleString("uz-UZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export default async function InstructorStudentsPage() {
  const { supabase, user } = await requireInstructorPage({
    loginRedirect: "/login?redirect=/instructor/students",
    fallbackRedirect: "/instructor",
  });
  const data = await getInstructorWorkspaceData(user.id, supabase);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-10 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Student learning intelligence
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Students
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Kurslaringizdagi studentlar, progress, o'qish vaqti, completion va
            oxirgi aktivlik instructor ko'rishi uchun jamlangan.
          </p>
        </div>
        <Link
          href="/instructor/questions"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
        >
          <MessageSquare className="h-4 w-4" />
          Q&A ni ochish
        </Link>
      </div>

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {[
          {
            label: "Active students",
            value: data.students.length.toLocaleString("uz-UZ"),
            icon: Users,
          },
          {
            label: "Completed",
            value: data.metrics.completedStudents.toLocaleString("uz-UZ"),
            icon: GraduationCap,
          },
          {
            label: "Avg progress",
            value: `${data.metrics.averageProgress}%`,
            icon: BookOpen,
          },
          {
            label: "Learning time",
            value: `${data.metrics.totalLearningHours} soat`,
            icon: Clock3,
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

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 px-6 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 lg:grid-cols-[minmax(0,1fr)_120px_120px_150px_170px]">
          <span>Student</span>
          <span>Courses</span>
          <span>Progress</span>
          <span>Learning time</span>
          <span>Last activity</span>
        </div>

        <div className="divide-y divide-slate-100">
          {data.students.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              Hali student enrollment yo'q.
            </div>
          ) : (
            data.students.map((student) => (
              <article
                key={student.id}
                className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_120px_120px_150px_170px] lg:items-center"
              >
                <div>
                  <p className="font-black text-slate-950">{student.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {student.email ?? "Email ko'rinmayapti"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {student.courseTitles.map((title) => (
                      <span
                        key={`${student.id}-${title}`}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm font-black text-slate-700">
                  {student.enrolledCourses} active
                </p>

                <div>
                  <p className="mb-2 text-sm font-black text-slate-950">
                    {student.averageProgress}%
                  </p>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-700"
                      style={{
                        width: `${clampPercent(student.averageProgress)}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-sm font-black text-slate-700">
                  {formatMinutes(student.totalLearningMinutes)}
                </p>

                <p className="text-sm text-slate-500">
                  {formatDate(student.lastAccessedAt)}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
