import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { PRIMARY_ADMIN_EMAIL } from "@/lib/admin-access";
import { SITE_DOCUMENTS_CACHE_TAG } from "@/lib/cache-tags";
import type { Course } from "@/lib/catalog";
import { requireInstructorContext } from "@/lib/server/auth";
import { sanitizeCourseSubmissionInput } from "@/lib/server/course-submissions";
import {
  safeQueueNotificationJob,
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit";

function getAuthErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Instructor yoki admin ruxsati kerak" },
    { status: 403 }
  );
}

function revalidateInstructorPaths(id?: string) {
  revalidatePath("/instructor");
  revalidatePath("/instructor/analytics");
  revalidatePath("/instructor/students");
  revalidatePath("/instructor/submissions");
  if (id) {
    revalidatePath(`/instructor/submissions/${id}`);
  }
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
}

function getTemplateString(
  value: Record<string, unknown> | null | undefined,
  key: string
) {
  const raw = value?.[key];
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

async function publishInstructorCourse(options: {
  supabase: Awaited<ReturnType<typeof requireInstructorContext>>["supabase"];
  user: Awaited<ReturnType<typeof requireInstructorContext>>["user"];
  submissionId: string;
  instructorName: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  description: string;
  course: Course;
}) {
  const {
    supabase,
    user,
    submissionId,
    instructorName,
    slug,
    title,
    category,
    price,
    description,
    course,
  } = options;

  if (process.env.ALLOW_INSTRUCTOR_DIRECT_PUBLISH !== "true") {
    await safeQueueNotificationJob(
      {
        channel: "email",
        eventType: "course_submission_submitted",
        recipient: PRIMARY_ADMIN_EMAIL,
        subject: `Instructor kurs review so'radi: ${title}`,
        templateKey: "course_submission_submitted",
        payload: {
          submissionId,
          title,
          slug,
          instructorName,
          instructorEmail: user.email,
          submittedAt: new Date().toISOString(),
        },
        dedupeKey: `course-submission:${submissionId}:admin-review:${Date.now()}`,
        provider: "provider_pending",
      },
      { supabase }
    );

    return { ok: true as const };
  }

  const now = new Date().toISOString();
  const { data: existingDocument } = await supabase
    .from("site_documents")
    .select("id, sort_order")
    .eq("kind", "course")
    .eq("slug", slug)
    .maybeSingle();

  let nextSortOrder = existingDocument?.sort_order ?? 0;

  if (!existingDocument) {
    const { data: latestDocument } = await supabase
      .from("site_documents")
      .select("sort_order")
      .eq("kind", "course")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    nextSortOrder = (latestDocument?.sort_order ?? -1) + 1;
  }

  const metadata = {
    source: "instructor_direct_publish",
    submissionId,
    instructorId: user.id,
    publishedBy: user.id,
    publishedAt: now,
  };

  const { error: documentError } = await supabase.from("site_documents").upsert(
    {
      kind: "course",
      slug,
      title,
      status: "published",
      sort_order: nextSortOrder,
      payload: course,
      metadata,
      updated_by: user.id,
    },
    { onConflict: "kind,slug" }
  );

  if (documentError) {
    return {
      ok: false as const,
      error:
        documentError.code === "42501"
          ? "Instructor uchun site_documents RLS policy yetishmayapti. Yangi migrationni Supabase'da run qiling."
          : documentError.message,
    };
  }

  const { error: courseError } = await supabase.from("courses").upsert(
    {
      id: slug,
      instructor_id: user.id,
      title,
      description,
      price,
      category,
      status: "published",
      metadata,
    },
    { onConflict: "id" }
  );

  if (courseError) {
    return {
      ok: false as const,
      error:
        courseError.code === "42501"
          ? "Instructor uchun courses RLS policy yetishmayapti. Yangi migrationni Supabase'da run qiling."
          : courseError.message,
    };
  }

  const { data: application } = await supabase
    .from("instructor_applications")
    .select("organization_name, certificate_template")
    .eq("user_id", user.id)
    .maybeSingle();
  const template =
    application?.certificate_template &&
    typeof application.certificate_template === "object" &&
    !Array.isArray(application.certificate_template)
      ? (application.certificate_template as Record<string, unknown>)
      : {};
  const courseTemplate = course.certificateTemplate ?? {};

  await supabase.from("certificate_templates").upsert(
    {
      instructor_id: user.id,
      course_id: slug,
      title:
        getTemplateString(courseTemplate, "title") ??
        getTemplateString(template, "title") ??
        `${title} Certificate`,
      organization_name:
        getTemplateString(courseTemplate, "organizationName") ??
        getTemplateString(template, "organizationName") ??
        application?.organization_name ??
        "Kings Education",
      signature_name:
        getTemplateString(courseTemplate, "signatureName") ??
        getTemplateString(template, "signatureName") ?? instructorName,
      signature_title:
        getTemplateString(courseTemplate, "signatureTitle") ?? "Instructor",
      certificate_body:
        getTemplateString(courseTemplate, "certificateBody") ??
        "has successfully completed the course requirements and demonstrated practical learning progress.",
      accent_color:
        getTemplateString(courseTemplate, "accentColor") ?? "#064e3b",
      seal_text:
        getTemplateString(courseTemplate, "sealText") ??
        getTemplateString(template, "sealText") ??
        "KINGS VERIFIED",
      metadata: {
        source: "instructor_application_template",
        submissionId,
      },
    },
    { onConflict: "instructor_id,course_id" }
  );

  const { error: updateError } = await supabase
    .from("course_submissions")
    .update({
      status: "published",
      review_note: null,
      submitted_at: now,
      reviewed_at: now,
      reviewed_by: user.id,
      published_at: now,
    })
    .eq("id", submissionId)
    .eq("instructor_id", user.id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "system",
      eventType: "course_submission_direct_published",
      entityType: "course_submission",
      entityId: submissionId,
      title: "Approved instructor kursni public saytga chiqardi",
      detail: {
        slug,
        title,
        price,
        category,
      },
      dedupeKey: `course-submission:${submissionId}:direct-published`,
    },
    { supabase }
  );

  await safeQueueNotificationJob(
    {
      channel: "email",
      eventType: "instructor_course_direct_published",
      recipient: PRIMARY_ADMIN_EMAIL,
      subject: `Instructor yangi kurs publish qildi: ${title}`,
      templateKey: "instructor_course_direct_published",
      payload: {
        submissionId,
        title,
        slug,
        instructorName,
        instructorEmail: user.email,
      },
      dedupeKey: `course-submission:${submissionId}:admin-direct-published`,
      provider: "provider_pending",
    },
    { supabase }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: user.email,
      eventType: "course_submission_published",
      subject: "Kursingiz public saytga chiqdi",
      payload: {
        submissionId,
        title,
        slug,
      },
      dedupeKey: `course-submission:${submissionId}:published:email`,
      force: true,
    },
    { supabase }
  );

  revalidatePath("/courses");
  revalidatePath("/");
  revalidatePath(`/courses/${slug}`);
  revalidateTag(SITE_DOCUMENTS_CACHE_TAG, "max");

  return { ok: true as const };
}

export async function POST(request: Request) {
  let context: Awaited<ReturnType<typeof requireInstructorContext>>;

  try {
    context = await requireInstructorContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const { supabase, user } = context;
  const rateLimit = checkRateLimit(
    getRateLimitKey(request, "instructor-submission-create", user.id),
    {
      limit: 50,
      windowMs: 60 * 60 * 1000,
    }
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Kurs draftlari juda tez yuborilyapti. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const body = (await request.json().catch(() => null)) as {
    intent?: "save" | "submit";
    submission?: unknown;
  } | null;
  const intent = body?.intent === "submit" ? "submit" : "save";
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const instructorName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Kings Instructor";

  const sanitized = sanitizeCourseSubmissionInput(body?.submission, {
    instructorName,
  });

  if (!sanitized.ok) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("course_submissions")
    .insert({
      instructor_id: user.id,
      slug: sanitized.data.slug,
      title: sanitized.data.title,
      subtitle: sanitized.data.subtitle || null,
      description: sanitized.data.description,
      category: sanitized.data.category,
      price: sanitized.data.price,
      status: intent === "submit" ? "submitted" : "draft",
      submitted_at: intent === "submit" ? new Date().toISOString() : null,
      payload: sanitized.course,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Bu slug allaqachon mavjud. Boshqa slug kiriting."
            : error.code === "42P01"
              ? "course_submissions jadvali hali yaratilmagan. Phase 5 migrationni run qiling."
              : error.message,
      },
      { status: 500 }
    );
  }

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "system",
      eventType:
        intent === "submit"
          ? "course_submission_submitted"
          : "course_submission_created",
      entityType: "course_submission",
      entityId: data.id,
      title:
        intent === "submit"
          ? "Instructor kursni review'ga yubordi"
          : "Instructor yangi draft yaratdi",
      detail: {
        slug: sanitized.data.slug,
        title: sanitized.data.title,
      },
      dedupeKey: `course-submission:${data.id}:${intent}`,
    },
    { supabase }
  );

  if (intent === "submit") {
    const publishResult = await publishInstructorCourse({
      supabase,
      user,
      submissionId: data.id,
      instructorName,
      slug: sanitized.data.slug,
      title: sanitized.data.title,
      category: sanitized.data.category,
      price: sanitized.data.price,
      description: sanitized.data.description,
      course: sanitized.course,
    });

    if (!publishResult.ok) {
      return NextResponse.json({ error: publishResult.error }, { status: 500 });
    }
  }

  revalidateInstructorPaths(data.id);

  return NextResponse.json({
    ok: true,
    id: data.id,
    slug: data.slug,
    status:
      intent === "submit" && process.env.ALLOW_INSTRUCTOR_DIRECT_PUBLISH === "true"
        ? "published"
        : intent === "submit"
          ? "submitted"
          : "draft",
  });
}

export async function PUT(request: Request) {
  let context: Awaited<ReturnType<typeof requireInstructorContext>>;

  try {
    context = await requireInstructorContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const { supabase, user } = context;
  const rateLimit = checkRateLimit(
    getRateLimitKey(request, "instructor-submission-update", user.id),
    {
      limit: 90,
      windowMs: 60 * 60 * 1000,
    }
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Kurs update juda ko'p yuborildi. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    intent?: "save" | "submit";
    submission?: unknown;
  } | null;

  const submissionId = typeof body?.id === "string" ? body.id.trim() : "";
  const intent = body?.intent === "submit" ? "submit" : "save";

  if (!submissionId) {
    return NextResponse.json(
      { error: "Submission identifikatori topilmadi." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("course_submissions")
    .select("id, status, review_note")
    .eq("id", submissionId)
    .eq("instructor_id", user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "Submission topilmadi." },
      { status: 404 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const instructorName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Kings Instructor";

  const sanitized = sanitizeCourseSubmissionInput(body?.submission, {
    instructorName,
  });

  if (!sanitized.ok) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const nextStatus =
    intent === "submit"
      ? "submitted"
      : existing.status === "published" || existing.status === "submitted"
        ? "draft"
        : existing.status;

  const { error } = await supabase
    .from("course_submissions")
    .update({
      slug: sanitized.data.slug,
      title: sanitized.data.title,
      subtitle: sanitized.data.subtitle || null,
      description: sanitized.data.description,
      category: sanitized.data.category,
      price: sanitized.data.price,
      status: nextStatus,
      payload: sanitized.course,
      submitted_at: intent === "submit" ? new Date().toISOString() : null,
    })
    .eq("id", submissionId)
    .eq("instructor_id", user.id);

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Bu slug allaqachon mavjud. Boshqa slug kiriting."
            : error.message,
      },
      { status: 500 }
    );
  }

  if (intent === "submit") {
    const publishResult = await publishInstructorCourse({
      supabase,
      user,
      submissionId,
      instructorName,
      slug: sanitized.data.slug,
      title: sanitized.data.title,
      category: sanitized.data.category,
      price: sanitized.data.price,
      description: sanitized.data.description,
      course: sanitized.course,
    });

    if (!publishResult.ok) {
      return NextResponse.json({ error: publishResult.error }, { status: 500 });
    }
  } else {
    await safeRecordOperationalEvent(
      {
        userId: user.id,
        scope: "system",
        eventType: "course_submission_saved",
        entityType: "course_submission",
        entityId: submissionId,
        title: "Instructor draftni yangiladi",
        detail: {
          slug: sanitized.data.slug,
          title: sanitized.data.title,
          previousStatus: existing.status,
          nextStatus,
        },
        dedupeKey: `course-submission:${submissionId}:saved:${nextStatus}`,
      },
      { supabase }
    );
  }

  revalidateInstructorPaths(submissionId);

  return NextResponse.json({
    ok: true,
    id: submissionId,
    status:
      intent === "submit" && process.env.ALLOW_INSTRUCTOR_DIRECT_PUBLISH === "true"
        ? "published"
        : intent === "submit"
          ? "submitted"
          : nextStatus,
    reviewNote: existing.review_note,
  });
}
