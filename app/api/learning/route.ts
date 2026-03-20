import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCourseById } from "@/lib/catalog";

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

  const body = (await req.json().catch(() => null)) as
    | { courseId?: string; lessonId?: string; durationMinutes?: number }
    | null;

  const courseId = body?.courseId?.trim();
  const lessonId = body?.lessonId?.trim();
  const durationMinutes = Number.isFinite(body?.durationMinutes)
    ? Math.max(0, Math.min(Math.round(body?.durationMinutes ?? 0), 240))
    : 0;

  if (!courseId || !lessonId) {
    return Response.json(
      { error: "Kurs yoki dars identifikatori topilmadi." },
      { status: 400 }
    );
  }

  const course = getCourseById(courseId);
  if (!course) {
    return Response.json({ error: "Kurs topilmadi." }, { status: 404 });
  }

  const allLessons = course.modules.flatMap((module) => module.lessons);
  const lessonIndex = allLessons.findIndex((lesson) => lesson.id === lessonId);

  if (lessonIndex === -1) {
    return Response.json({ error: "Dars topilmadi." }, { status: 404 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, progress_percent, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return Response.json(
      { error: "Bu kursga access topilmadi." },
      { status: 403 }
    );
  }

  const now = new Date().toISOString();
  const calculatedProgress = Math.round(
    ((lessonIndex + 1) / Math.max(allLessons.length, 1)) * 100
  );
  const progressPercent = Math.max(
    enrollment.progress_percent ?? 0,
    calculatedProgress
  );
  const completedAt =
    progressPercent >= 100 ? enrollment.completed_at ?? now : null;

  let { error: updateError } = await supabase
    .from("enrollments")
    .update({
      progress_percent: progressPercent,
      last_lesson_id: lessonId,
      last_accessed_at: now,
      completed_at: completedAt,
    })
    .eq("id", enrollment.id);

  if (updateError && errorMentions(updateError, "last_lesson_id")) {
    const fallbackResult = await supabase
      .from("enrollments")
      .update({
        progress_percent: progressPercent,
        last_accessed_at: now,
        completed_at: completedAt,
      })
      .eq("id", enrollment.id);

    updateError = fallbackResult.error;
  }

  if (updateError) {
    return Response.json(
      { error: "Progressni saqlashda muammo yuz berdi." },
      { status: 500 }
    );
  }

  if (durationMinutes > 0) {
    let { error: sessionError } = await supabase.from("learning_sessions").insert({
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      duration_minutes: durationMinutes,
    });

    if (sessionError && errorMentions(sessionError, "lesson_id")) {
      const fallbackSession = await supabase.from("learning_sessions").insert({
        user_id: user.id,
        course_id: courseId,
        duration_minutes: durationMinutes,
      });

      sessionError = fallbackSession.error;
    }

    if (sessionError) {
      console.error("learning_sessions insert failed", sessionError);
    }
  }

  if (completedAt) {
    const { error: certificateError } = await supabase
      .from("certificates")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          issued_at: completedAt,
        },
        { onConflict: "user_id,course_id", ignoreDuplicates: true }
      );

    if (certificateError) {
      console.error("certificate upsert failed", certificateError);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/watch`);

  return Response.json({ progressPercent });
}
