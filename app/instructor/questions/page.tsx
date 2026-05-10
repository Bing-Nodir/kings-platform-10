import { answerCourseQuestion } from "../actions";
import { requireInstructorPage } from "@/lib/server/auth";
import { getInstructorWorkspaceData } from "@/lib/server/instructor-workspace";

type InstructorQuestionsPageProps = {
  searchParams: Promise<{ question_status?: string }>;
};

const messages: Record<string, string> = {
  answered: "Javob saqlandi va studentga notification queue yaratildi.",
  invalid: "Javob matni juda qisqa.",
  "not-found": "Savol topilmadi.",
  "missing-backend": "course_questions jadvali hali Supabase'da yo'q.",
  failed: "Savolga javob saqlanmadi. RLS yoki ulanishni tekshiring.",
};

export default async function InstructorQuestionsPage({
  searchParams,
}: InstructorQuestionsPageProps) {
  const [{ question_status: status }, { supabase, user }] = await Promise.all([
    searchParams,
    requireInstructorPage({
      loginRedirect: "/login?redirect=/instructor/questions",
      fallbackRedirect: "/instructor",
    }),
  ]);
  const data = await getInstructorWorkspaceData(user.id, supabase);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-10 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-950">Student Q&A</h1>
        <p className="mt-2 text-slate-600">
          Learning roomdan kelgan savollar va instructor javoblari.
        </p>
      </div>

      {status && messages[status] ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
          {messages[status]}
        </div>
      ) : null}

      <div className="grid gap-5">
        {data.recentQuestions.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-8 py-16 text-center text-sm text-slate-500">
            Hali student savollari yo'q.
          </div>
        ) : (
          data.recentQuestions.map((question) => (
            <article
              key={question.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-950">
                      {question.studentName}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-600">
                      {question.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {question.courseTitle} {question.lesson_id ? `| ${question.lesson_id}` : ""}
                  </p>
                  <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">
                    {question.question_text}
                  </p>
                  {question.answer_text ? (
                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
                      {question.answer_text}
                    </div>
                  ) : null}
                </div>

                <form action={answerCourseQuestion} className="rounded-2xl bg-slate-50 p-4">
                  <input type="hidden" name="question_id" value={question.id} />
                  <textarea
                    name="answer"
                    defaultValue={question.answer_text ?? ""}
                    rows={7}
                    placeholder="Studentga aniq, amaliy javob yozing..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-950 outline-none focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
                  >
                    Javobni saqlash
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
