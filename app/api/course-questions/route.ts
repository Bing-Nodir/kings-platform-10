import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCourseByIdData } from "@/lib/content-store";
import {
  getAuthenticatedContext,
  hasCourseEnrollment,
} from "@/lib/server/auth";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit";
import {
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";

async function resolveInstructorId(
  supabase: Awaited<ReturnType<typeof getAuthenticatedContext>>["supabase"],
  courseId: string
) {
  const { data: course } = await supabase
    .from("courses")
    .select("instructor_id")
    .eq("id", courseId)
    .maybeSingle();

  if (course?.instructor_id) {
    return course.instructor_id as string;
  }

  const { data: submission } = await supabase
    .from("course_submissions")
    .select("instructor_id")
    .eq("slug", courseId)
    .eq("status", "published")
    .maybeSingle();

  return (submission?.instructor_id as string | undefined) ?? null;
}

export async function GET(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = normalizeSingleLine(searchParams.get("courseId"), 120);

  if (!courseId) {
    return NextResponse.json({ error: "courseId kerak" }, { status: 400 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("course_questions")
    .select("id, lesson_id, question_text, answer_text, status, created_at, answered_at")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "42P01"
            ? "course_questions jadvali hali yaratilmagan."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ questions: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    getRateLimitKey(request, "course-question-create", user.id),
    {
      limit: 25,
      windowMs: 10 * 60 * 1000,
    }
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Savollar juda tez yuborilyapti. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const body = (await request.json().catch(() => null)) as {
    courseId?: string;
    lessonId?: string;
    question?: string;
  } | null;
  const courseId = normalizeSingleLine(body?.courseId, 120);
  const lessonId = normalizeSingleLine(body?.lessonId, 120);
  const question = normalizeMultiline(body?.question ?? "", 1200);

  if (!courseId || question.length < 5) {
    return NextResponse.json(
      { error: "Kurs va savol matni kerak" },
      { status: 400 }
    );
  }

  if (!(await getCourseByIdData(courseId))) {
    return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const instructorId = await resolveInstructorId(supabase, courseId);
  const { data, error } = await supabase
    .from("course_questions")
    .insert({
      course_id: courseId,
      lesson_id: lessonId || null,
      student_id: user.id,
      instructor_id: instructorId,
      question_text: question,
      status: "open",
    })
    .select("id, lesson_id, question_text, answer_text, status, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "42P01"
            ? "course_questions jadvali hali yaratilmagan."
            : error.message,
      },
      { status: 500 }
    );
  }

  revalidatePath("/instructor");
  revalidatePath("/instructor/questions");
  revalidatePath(`/courses/${courseId}/watch`);

  return NextResponse.json({ ok: true, question: data });
}
