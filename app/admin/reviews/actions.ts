"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_DOCUMENTS_CACHE_TAG } from "@/lib/cache-tags";
import { requireAdminContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";

const VALID_DECISIONS = new Set(["published", "changes_requested"]);
const VALID_APPLICATION_DECISIONS = new Set([
  "approved",
  "rejected",
  "changes_requested",
]);

export async function reviewCourseSubmission(formData: FormData) {
  const submissionId = formData.get("submission_id")?.toString().trim();
  const decision = formData.get("decision")?.toString().trim();
  const note = formData.get("note")?.toString().trim() ?? "";

  if (!submissionId || !decision || !VALID_DECISIONS.has(decision)) {
    return;
  }

  try {
    const { supabase, user } = await requireAdminContext();
    const { data: submission, error: submissionError } = await supabase
      .from("course_submissions")
      .select("id, instructor_id, slug, title, payload, status")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return;
    }

    const { data: instructorProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", submission.instructor_id)
      .maybeSingle();

    if (decision === "published") {
      const { data: existingDocument } = await supabase
        .from("site_documents")
        .select("id, sort_order")
        .eq("kind", "course")
        .eq("slug", submission.slug)
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

      const { error: documentError } = await supabase
        .from("site_documents")
        .upsert(
          {
            kind: "course",
            slug: submission.slug,
            title: submission.title,
            status: "published",
            sort_order: nextSortOrder,
            payload: submission.payload,
            metadata: {
              source: "instructor_submission",
              submissionId: submission.id,
              instructorId: submission.instructor_id,
              approvedBy: user.id,
            },
            updated_by: user.id,
          },
          { onConflict: "kind,slug" }
        );

      if (documentError) {
        return;
      }

      const coursePayload = submission.payload as {
        id?: string;
        description?: string;
        price?: number;
      };
      const { error: courseError } = await supabase.from("courses").upsert(
        {
          id: coursePayload.id ?? submission.slug,
          instructor_id: submission.instructor_id,
          title: submission.title,
          description: coursePayload.description ?? null,
          price: coursePayload.price ?? 0,
        },
        { onConflict: "id" }
      );

      if (courseError) {
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("course_submissions")
      .update({
        status: decision,
        review_note: note || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        published_at:
          decision === "published" ? new Date().toISOString() : null,
      })
      .eq("id", submissionId);

    if (updateError) {
      return;
    }

    await safeRecordOperationalEvent(
      {
        userId: submission.instructor_id,
        scope: "system",
        eventType: `course_submission_${decision}`,
        entityType: "course_submission",
        entityId: submissionId,
        title:
          decision === "published"
            ? "Admin kursni public saytga chiqardi"
            : "Admin submission bo'yicha tuzatish so'radi",
        detail: {
          slug: submission.slug,
          title: submission.title,
          note,
        },
        dedupeKey: `course-submission:${submissionId}:${decision}`,
      },
      { supabase }
    );

    await safeQueueUserEmailNotification(
      {
        userId: submission.instructor_id,
        email: instructorProfile?.email ?? null,
        eventType: `course_submission_${decision}`,
        subject:
          decision === "published"
            ? "Kursingiz public saytga chiqarildi"
            : "Kursingiz bo'yicha admin izohi keldi",
        payload: {
          submissionId,
          title: submission.title,
          slug: submission.slug,
          note,
          instructorName: instructorProfile?.full_name,
        },
        dedupeKey: `course-submission:${submissionId}:${decision}:email`,
        force: true,
      },
      { supabase }
    );

    revalidatePath("/admin");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/reviews");
    revalidatePath("/instructor");
    revalidatePath("/instructor/submissions");
    revalidatePath(`/instructor/submissions/${submissionId}`);
    revalidatePath("/courses");
    revalidatePath("/");
    revalidatePath(`/courses/${submission.slug}`);
    revalidateTag(SITE_DOCUMENTS_CACHE_TAG, "max");

    return;
  } catch {
    return;
  }
}

export async function reviewInstructorApplication(formData: FormData) {
  const applicationId = formData.get("application_id")?.toString().trim();
  const decision = formData.get("decision")?.toString().trim();
  const note = formData.get("note")?.toString().trim() ?? "";

  if (
    !applicationId ||
    !decision ||
    !VALID_APPLICATION_DECISIONS.has(decision)
  ) {
    return;
  }

  try {
    const { supabase, user } = await requireAdminContext();
    const { data: application, error: applicationError } = await supabase
      .from("instructor_applications")
      .select(
        "id, user_id, professional_title, expertise, portfolio_url, statement, status"
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", application.user_id)
      .maybeSingle();

    if (decision === "approved" || profile?.role === "instructor") {
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: decision === "approved" ? "instructor" : "student" })
        .eq("id", application.user_id);

      if (roleError) {
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("instructor_applications")
      .update({
        status: decision,
        admin_note: note || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      return;
    }

    await safeRecordOperationalEvent(
      {
        userId: application.user_id,
        scope: "security",
        eventType: `instructor_application_${decision}`,
        entityType: "instructor_application",
        entityId: applicationId,
        title:
          decision === "approved"
            ? "Admin instructor rolini tasdiqladi"
            : "Admin instructor arizasini review qildi",
        detail: {
          previousRole: profile?.role,
          decision,
          note,
          reviewedBy: user.id,
        },
        dedupeKey: `instructor-application:${applicationId}:${decision}:${Date.now()}`,
      },
      { supabase }
    );

    await safeQueueUserEmailNotification(
      {
        userId: application.user_id,
        email: profile?.email,
        eventType: `instructor_application_${decision}`,
        subject:
          decision === "approved"
            ? "Instructor panelingiz ochildi"
            : "Instructor arizangiz bo'yicha admin izohi",
        payload: {
          fullName: profile?.full_name,
          professionalTitle: application.professional_title,
          decision,
          note,
        },
        dedupeKey: `instructor-application:${applicationId}:${decision}:email`,
        force: true,
      },
      { supabase }
    );

    revalidatePath("/admin");
    revalidatePath("/admin/reviews");
    revalidatePath("/admin/users");
    revalidatePath("/instructor");
    revalidatePath("/instructor/students");
    revalidatePath("/instructor/analytics");

    return;
  } catch {
    return;
  }
}
