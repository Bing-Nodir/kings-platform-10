"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PRIMARY_ADMIN_EMAIL } from "@/lib/admin-access";
import {
  getAuthenticatedContext,
  isInstructorUser,
  requireInstructorContext,
} from "@/lib/server/auth";
import {
  safeQueueNotificationJob,
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import {
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";

function formText(formData: FormData, key: string, maxLength: number) {
  return normalizeSingleLine(formData.get(key), maxLength);
}

function formLongText(formData: FormData, key: string, maxLength: number) {
  return normalizeMultiline(formData.get(key) ?? "", maxLength);
}

export async function submitInstructorApplication(formData: FormData) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    redirect("/login?redirect=/instructor");
  }

  if (await isInstructorUser(supabase, user.id, user.email)) {
    redirect("/instructor");
  }

  const professionalTitle = formText(formData, "professional_title", 120);
  const organizationName = formText(formData, "organization_name", 160);
  const contactEmail =
    formText(formData, "contact_email", 220) || user.email || "";
  const contactPhone = formText(formData, "contact_phone", 80);
  const publicBio = formLongText(formData, "public_bio", 1000);
  const photoUrl = formText(formData, "photo_url", 500);
  const expertise = formLongText(formData, "expertise", 800);
  const portfolioUrl = formText(formData, "portfolio_url", 400);
  const payoutMethod = formText(formData, "payout_method", 160);
  const certificatesText = formLongText(formData, "certificates", 1200);
  const certificateTitle = formText(formData, "certificate_title", 140);
  const certificateOrganization = formText(
    formData,
    "certificate_organization",
    160
  );
  const certificateSignature = formText(
    formData,
    "certificate_signature",
    120
  );
  const certificateSeal = formText(formData, "certificate_seal", 80);
  const statement = formLongText(formData, "statement", 1800);

  if (!statement || statement.length < 40) {
    redirect("/instructor?application_status=needs-statement");
  }

  const { error } = await supabase.from("instructor_applications").upsert(
    {
      user_id: user.id,
      professional_title: professionalTitle || null,
      organization_name: organizationName || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      public_bio: publicBio || null,
      photo_url: photoUrl || null,
      expertise: expertise || null,
      portfolio_url: portfolioUrl || null,
      payout_method: payoutMethod || null,
      certificates: certificatesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8),
      certificate_template: {
        title: certificateTitle || "Kings Education Certificate",
        organizationName: certificateOrganization || organizationName || null,
        signatureName: certificateSignature || null,
        sealText: certificateSeal || "KINGS VERIFIED",
      },
      statement,
      status: "pending",
      admin_note: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    const status = error.code === "42P01" ? "missing-backend" : "failed";
    redirect(`/instructor?application_status=${status}`);
  }

  await supabase
    .from("profiles")
    .update({
      bio: publicBio || null,
      company_name: organizationName || null,
      phone: contactPhone || null,
      avatar_url: photoUrl || null,
    })
    .eq("id", user.id);

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "system",
      eventType: "instructor_application_submitted",
      entityType: "instructor_application",
      entityId: user.id,
      title: "User instructor bo'lish uchun ariza yubordi",
      detail: {
        professionalTitle,
        organizationName,
        contactEmail,
        expertise,
        portfolioUrl,
      },
      dedupeKey: `instructor-application:${user.id}:submitted:${Date.now()}`,
    },
    { supabase }
  );

  await safeQueueNotificationJob(
    {
      channel: "email",
      eventType: "instructor_application_review_requested",
      recipient: PRIMARY_ADMIN_EMAIL,
      subject: "Yangi instructor arizasi",
      templateKey: "instructor_application_review_requested",
      payload: {
        userId: user.id,
        email: user.email,
        professionalTitle,
        organizationName,
        contactEmail,
        contactPhone,
        portfolioUrl,
      },
      dedupeKey: `instructor-application:${user.id}:admin-alert:${Date.now()}`,
      provider: "provider_pending",
    },
    { supabase }
  );

  revalidatePath("/instructor");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  redirect("/instructor?application_status=submitted");
}

export async function answerCourseQuestion(formData: FormData) {
  const questionId = formText(formData, "question_id", 120);
  const answer = formLongText(formData, "answer", 4000);

  if (!questionId || answer.length < 3) {
    redirect("/instructor/questions?question_status=invalid");
  }

  const { supabase, user } = await requireInstructorContext();
  const { data: question } = await supabase
    .from("course_questions")
    .select("id, student_id, course_id, question_text")
    .eq("id", questionId)
    .maybeSingle();

  if (!question) {
    redirect("/instructor/questions?question_status=not-found");
  }

  const { error } = await supabase
    .from("course_questions")
    .update({
      answer_text: answer,
      status: "answered",
      answered_at: new Date().toISOString(),
      instructor_id: user.id,
    })
    .eq("id", questionId);

  if (error) {
    const status = error.code === "42P01" ? "missing-backend" : "failed";
    redirect(`/instructor/questions?question_status=${status}`);
  }

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "support",
      eventType: "course_question_answered",
      entityType: "course_question",
      entityId: questionId,
      title: "Instructor student savoliga javob berdi",
      detail: {
        courseId: question.course_id,
      },
      dedupeKey: `course-question:${questionId}:answered:${Date.now()}`,
    },
    { supabase }
  );

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", question.student_id)
    .maybeSingle();

  await safeQueueUserEmailNotification(
    {
      userId: question.student_id,
      email: studentProfile?.email,
      eventType: "course_question_answered",
      subject: "Savolingizga instructor javob berdi",
      payload: {
        courseId: question.course_id,
        question: question.question_text,
        answer,
        studentName: studentProfile?.full_name,
      },
      dedupeKey: `course-question:${questionId}:answered-email`,
      force: true,
    },
    { supabase }
  );

  revalidatePath("/instructor");
  revalidatePath("/instructor/questions");
  revalidatePath("/instructor/analytics");
  revalidatePath(`/courses/${question.course_id}/watch`);
  redirect("/instructor/questions?question_status=answered");
}
