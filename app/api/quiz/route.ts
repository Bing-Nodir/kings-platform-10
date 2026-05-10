import { NextResponse } from "next/server";
import { getCourseByIdData } from "@/lib/content-store";
import {
  quizSubmitRequestSchema,
  quizSubmitResponseSchema,
} from "@/lib/server/api-schemas";
import { getAuthenticatedContext, hasCourseEnrollment } from "@/lib/server/auth";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit";
import { clampNumber, normalizeSingleLine } from "@/lib/server/validation";
import { getQuizByCourseId } from "@/lib/quizzes";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = normalizeSingleLine(searchParams.get("courseId"), 120);

  if (!courseId) {
    return NextResponse.json({ error: "courseId kerak" }, { status: 400 });
  }

  if (!(await getCourseByIdData(courseId)) || !getQuizByCourseId(courseId)) {
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

  const rateLimit = checkRateLimit(getRateLimitKey(request, "quiz-submit", user.id), {
    limit: 40,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Quiz javoblari juda tez yuborilyapti. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const parsedBody = quizSubmitRequestSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumotlar" }, { status: 400 });
  }

  const { courseId, lessonId } = parsedBody.data;

  if (!(await getCourseByIdData(courseId))) {
    return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const quiz = getQuizByCourseId(courseId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz topilmadi" }, { status: 404 });
  }

  const normalizedAnswers = parsedBody.data.answers.slice(0, quiz.questions.length);
  const answersByQuestion = Object.fromEntries(
    normalizedAnswers.map((answer) => [answer.qId, answer.ans])
  );
  const score = quiz.questions.filter(
    (question) => answersByQuestion[question.id] === question.correctId
  ).length;
  const total = quiz.questions.length;
  const percent = clampNumber(Math.round((score / total) * 100), 0, 100);
  const passed = percent >= quiz.passingScore;

  const admin = createAdminClient();
  const { error } = await admin.from("quiz_attempts").insert({
    user_id: user.id,
    course_id: courseId,
    lesson_id: lessonId || null,
    score,
    total,
    percent,
    passed,
    answers: normalizedAnswers,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const award = await supabase.rpc("award_quiz_knowledge_points", {
    p_course_id: courseId,
    p_lesson_id: lessonId || null,
    p_percent: percent,
    p_passed: passed,
  });

  const awardPayload = (award.data ?? {}) as { xpAwarded?: number };

  return NextResponse.json(
    quizSubmitResponseSchema.parse({
      ok: true,
      percent,
      passed,
      xpAwarded: awardPayload.xpAwarded ?? 0,
    })
  );
}
