import { revalidatePath } from "next/cache";
import { getCourseByIdData } from "@/lib/content-store";
import {
  jsonFromSchema,
  learningProgressRequestSchema,
  learningProgressResponseSchema,
} from "@/lib/server/api-schemas";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit";
import { createClient } from "@/utils/supabase/server";

function errorMentions(
  error: { message?: string; details?: string; hint?: string } | null,
  value: string
) {
  const combined = [error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return combined.includes(value.toLowerCase());
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  const rateLimit = checkRateLimit(
    getRateLimitKey(req, "learning-progress", userId),
    {
      limit: 180,
      windowMs: 10 * 60 * 1000,
    }
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Progress juda tez-tez yuborilyapti. Birozdan keyin davom eting."
    );
  }

  const parsedBody = learningProgressRequestSchema.safeParse(
    await req.json().catch(() => null)
  );

  if (!parsedBody.success) {
    return Response.json(
      { error: "Kurs yoki dars identifikatori topilmadi." },
      { status: 400 }
    );
  }

  const { courseId, lessonId } = parsedBody.data;
  const durationMinutes = Math.max(
    0,
    Math.min(Math.round(parsedBody.data.durationMinutes ?? 0), 240)
  );

  const course = await getCourseByIdData(courseId);
  if (!course) {
    return Response.json({ error: "Kurs topilmadi." }, { status: 404 });
  }

  const allLessons = course.modules.flatMap((module) => module.lessons);
  const lessonIndex = allLessons.findIndex((lesson) => lesson.id === lessonId);

  if (lessonIndex === -1) {
    return Response.json({ error: "Dars topilmadi." }, { status: 404 });
  }

  const previousLessonId =
    parsedBody.data.previousLessonId ?? allLessons[lessonIndex - 1]?.id ?? null;
  const totalLessons = parsedBody.data.totalLessons ?? allLessons.length;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, progress_percent, completed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return Response.json(
      { error: "Bu kursga access topilmadi." },
      { status: 403 }
    );
  }

  async function recordSessionIfNeeded() {
    if (durationMinutes <= 0) {
      return;
    }

    let { error: sessionError } = await supabase.from("learning_sessions").insert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      duration_minutes: durationMinutes,
    });

    if (sessionError && errorMentions(sessionError, "lesson_id")) {
      const fallbackSession = await supabase.from("learning_sessions").insert({
        user_id: userId,
        course_id: courseId,
        duration_minutes: durationMinutes,
      });

      sessionError = fallbackSession.error;
    }

    if (sessionError) {
      console.error("learning_sessions insert failed", sessionError);
    }
  }

  if (!parsedBody.data.markComplete) {
    await recordSessionIfNeeded();

    return jsonFromSchema(learningProgressResponseSchema, {
      progressPercent: enrollment.progress_percent ?? 0,
      completedLessons: Math.floor(
        ((enrollment.progress_percent ?? 0) / 100) * totalLessons
      ),
      xpAwarded: 0,
    });
  }

  const masteryResult = await supabase.rpc("record_lesson_mastery_progress", {
    p_course_id: courseId,
    p_lesson_id: lessonId,
    p_lesson_index: parsedBody.data.lessonIndex ?? lessonIndex,
    p_previous_lesson_id: previousLessonId,
    p_duration_minutes: durationMinutes,
    p_total_lessons: totalLessons,
    p_required_quiz_percent: 80,
  });

  if (masteryResult.error) {
    if (
      errorMentions(masteryResult.error, "record_lesson_mastery_progress") ||
      errorMentions(masteryResult.error, "lesson_mastery_progress")
    ) {
      return Response.json(
        {
          error:
            "Mastery learning migration hali Supabase'da qo'llanmagan. production_edtech_foundation migrationni push qiling.",
        },
        { status: 501 }
      );
    }

    return Response.json(
      {
        error:
          masteryResult.error.code === "42501"
            ? "Oldingi dars 100% va quiz 80%+ bo'lmaguncha bu dars yakunlanmaydi."
            : "Progressni saqlashda muammo yuz berdi.",
      },
      { status: masteryResult.error.code === "42501" ? 403 : 500 }
    );
  }

  await recordSessionIfNeeded();

  const rpcPayload = (masteryResult.data ?? {}) as {
    progressPercent?: number;
    completedLessons?: number;
    xpAwarded?: number;
  };
  const progressPercent =
    typeof rpcPayload.progressPercent === "number"
      ? rpcPayload.progressPercent
      : enrollment.progress_percent ?? 0;
  const completedAt =
    progressPercent >= 100
      ? enrollment.completed_at ?? new Date().toISOString()
      : null;

  if (completedAt) {
    const rpcResult = await supabase.rpc("issue_course_certificate", {
      p_course_id: courseId,
      p_student_name:
        user.user_metadata?.full_name ??
        user.email?.split("@")[0] ??
        "Kings Student",
      p_course_title: course.title,
      p_instructor_name: course.instructor,
      p_template: {},
    });
    const { error: certificateError } = rpcResult.error
      ? await supabase
          .from("certificates")
          .upsert(
            {
              user_id: userId,
              course_id: courseId,
              issued_at: completedAt,
            },
            { onConflict: "user_id,course_id", ignoreDuplicates: true }
          )
      : { error: null };

    if (certificateError) {
      console.error("certificate upsert failed", certificateError);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/watch`);

  return jsonFromSchema(learningProgressResponseSchema, {
    progressPercent,
    completedLessons: rpcPayload.completedLessons,
    xpAwarded: rpcPayload.xpAwarded,
  });
}
