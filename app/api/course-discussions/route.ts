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
  acknowledgeDiscussionRules,
  getStudentReputation,
  isStudentReputationBackendMissing,
} from "@/lib/server/student-reputation";
import {
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";

interface DiscussionMessageRow {
  id: string;
  course_id: string;
  lesson_id: string | null;
  user_id: string;
  body: string;
  status: string;
  moderation_reason: string | null;
  penalty_points: number | null;
  created_at: string;
}

function moderationBackendResponse(error?: { code?: string; message?: string } | null) {
  return NextResponse.json(
    {
      error: isStudentReputationBackendMissing(error ?? null)
        ? "course_discussion_messages/student_reputation jadvallari hali Supabase'da yo'q. Yangi migrationni push qiling."
        : error?.message ?? "Discussion backend xatosi.",
    },
    { status: isStudentReputationBackendMissing(error ?? null) ? 501 : 500 }
  );
}

async function requireDiscussionAccess(courseId: string) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Tizimga kiring" }, { status: 401 }),
    };
  }

  if (!(await getCourseByIdData(courseId))) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 }),
    };
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Faqat enrolled studentlar discussionni ko'radi" }, { status: 403 }),
    };
  }

  return { ok: true as const, supabase, user };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = normalizeSingleLine(searchParams.get("courseId"), 120);

  if (!courseId) {
    return NextResponse.json({ error: "courseId kerak" }, { status: 400 });
  }

  const access = await requireDiscussionAccess(courseId);
  if (!access.ok) {
    return access.response;
  }

  const { supabase, user } = access;
  const reputation = await getStudentReputation(user.id, supabase);

  if (!reputation.backendReady) {
    return moderationBackendResponse({ code: "42P01" });
  }

  const { data, error } = await supabase
    .from("course_discussion_messages")
    .select(
      "id, course_id, lesson_id, user_id, body, status, moderation_reason, penalty_points, created_at"
    )
    .eq("course_id", courseId)
    .or(`status.eq.visible,user_id.eq.${user.id}`)
    .order("created_at", { ascending: true })
    .limit(120);

  if (error) {
    return moderationBackendResponse(error);
  }

  const rows = (data ?? []) as DiscussionMessageRow[];
  const authorIds = Array.from(new Set(rows.map((row) => row.user_id)));
  const { data: profiles } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", authorIds)
    : { data: [] as Array<{ id: string; full_name: string | null; email: string | null; avatar_url: string | null }> };
  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return NextResponse.json({
    reputation,
    messages: rows.map((row) => {
      const author = profilesById.get(row.user_id);

      return {
        id: row.id,
        courseId: row.course_id,
        lessonId: row.lesson_id,
        userId: row.user_id,
        authorName: author?.full_name ?? author?.email?.split("@")[0] ?? "Student",
        authorAvatarUrl: author?.avatar_url ?? null,
        body: row.body,
        status: row.status,
        moderationReason: row.moderation_reason,
        penaltyPoints: row.penalty_points ?? 0,
        createdAt: row.created_at,
        isOwn: row.user_id === user.id,
      };
    }),
  });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, "course-discussion"), {
    limit: 80,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Discussion xabarlari juda tez yuborilyapti. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const body = (await request.json().catch(() => null)) as {
    courseId?: string;
    lessonId?: string;
    message?: string;
    acknowledgeRules?: boolean;
  } | null;
  const courseId = normalizeSingleLine(body?.courseId, 120);
  const lessonId = normalizeSingleLine(body?.lessonId, 120);
  const message = normalizeMultiline(body?.message ?? "", 1200);

  if (!courseId || message.length < 2) {
    return NextResponse.json(
      { error: "Kurs va xabar matni kerak" },
      { status: 400 }
    );
  }

  const access = await requireDiscussionAccess(courseId);
  if (!access.ok) {
    return access.response;
  }

  const { supabase, user } = access;
  let reputation = await getStudentReputation(user.id, supabase);

  if (!reputation.backendReady) {
    return moderationBackendResponse({ code: "42P01" });
  }

  if (!reputation.warningAcknowledgedAt) {
    if (!body?.acknowledgeRules) {
      return NextResponse.json(
        {
          error: "Discussion qoidalarini avval tasdiqlang",
          requiresAcknowledgement: true,
          reputation,
        },
        { status: 428 }
      );
    }

    reputation = await acknowledgeDiscussionRules(user.id, supabase);
  }

  if (reputation.mutedUntil && new Date(reputation.mutedUntil) > new Date()) {
    return NextResponse.json(
      {
        error: "Credit score pastligi sababli discussion yozish vaqtincha cheklangan.",
        mutedUntil: reputation.mutedUntil,
        reputation,
      },
      { status: 423 }
    );
  }

  const { data, error } = await supabase
    .from("course_discussion_messages")
    .insert({
      course_id: courseId,
      lesson_id: lessonId || null,
      user_id: user.id,
      body: message,
    })
    .select(
      "id, course_id, lesson_id, user_id, body, status, moderation_reason, penalty_points, created_at"
    )
    .single();

  if (error || !data) {
    return moderationBackendResponse(error);
  }

  const nextReputation = await getStudentReputation(user.id, supabase);
  revalidatePath(`/courses/${courseId}/watch`);
  revalidatePath("/dashboard");

  const row = data as DiscussionMessageRow;

  return NextResponse.json({
    ok: row.status === "visible",
    reputation: nextReputation,
    message: {
      id: row.id,
      courseId: row.course_id,
      lessonId: row.lesson_id,
      userId: row.user_id,
      authorName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Student",
      authorAvatarUrl: null,
      body: row.body,
      status: row.status,
      moderationReason: row.moderation_reason,
      penaltyPoints: row.penalty_points ?? 0,
      createdAt: row.created_at,
      isOwn: true,
    },
  });
}
