import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/catalog";
import { getAuthenticatedContext, hasCourseEnrollment } from "@/lib/server/auth";
import { clampNumber, normalizeSingleLine } from "@/lib/server/validation";
import { getQuizByCourseId } from "@/lib/quizzes";

function normalizeAnswers(answers: unknown) {
  if (!Array.isArray(answers)) {
    return [];
  }

  return answers
    .filter((answer) => answer && typeof answer === "object")
    .map((answer) => {
      const qId = "qId" in answer ? normalizeSingleLine(answer.qId, 64) : "";
      const ans = "ans" in answer ? normalizeSingleLine(answer.ans, 8) : "";
      return { qId, ans };
    })
    .filter((answer) => answer.qId && answer.ans);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = normalizeSingleLine(searchParams.get("courseId"), 120);

  if (!courseId) {
    return NextResponse.json({ error: "courseId kerak" }, { status: 400 });
  }

  if (!getCourseById(courseId) || !getQuizByCourseId(courseId)) {
    return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  }

  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { data } = await supabase
    .from("quiz_attempts")
    .select("id, score, total, percent, passed, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .order("completed_at", { ascending: false });

  const attempts = data ?? [];
  const best = attempts.reduce(
    (prev, curr) => (curr.percent > (prev?.percent ?? 0) ? curr : prev),
    null as (typeof attempts)[number] | null
  );

  return NextResponse.json({ best, attempts });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    courseId?: string;
    answers?: unknown[];
  } | null;
  const courseId = normalizeSingleLine(body?.courseId, 120);

  if (!courseId) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumotlar" }, { status: 400 });
  }

  if (!getCourseById(courseId)) {
    return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const quiz = getQuizByCourseId(courseId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz topilmadi" }, { status: 404 });
  }

  const normalizedAnswers = normalizeAnswers(body?.answers).slice(
    0,
    quiz.questions.length
  );
  const answersByQuestion = Object.fromEntries(
    normalizedAnswers.map((answer) => [answer.qId, answer.ans])
  );
  const score = quiz.questions.filter(
    (question) => answersByQuestion[question.id] === question.correctId
  ).length;
  const total = quiz.questions.length;
  const percent = clampNumber(Math.round((score / total) * 100), 0, 100);
  const passed = percent >= quiz.passingScore;

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    course_id: courseId,
    score,
    total,
    percent,
    passed,
    answers: normalizedAnswers,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
