"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCompanyContactData } from "@/lib/content-store";
import {
  safeQueueNotificationJob,
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import {
  isValidEmail,
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";
import { createClient } from "@/utils/supabase/server";

export async function submitContactForm(formData: FormData) {
  const name = normalizeSingleLine(formData.get("name"), 80);
  const email = normalizeSingleLine(formData.get("email"), 160).toLowerCase();
  const subject = normalizeSingleLine(formData.get("subject"), 120);
  const message = normalizeMultiline(formData.get("message"), 3000);

  if (!name || !email || !subject || !message) {
    redirect("/contact?error=missing");
  }

  if (!isValidEmail(email)) {
    redirect("/contact?error=invalid_email");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: insertedMessage, error } = await supabase
    .from("contact_messages")
    .insert({
      user_id: user?.id ?? null,
      name,
      email,
      subject,
      message,
    })
    .select("id")
    .single();

  if (error) {
    redirect("/contact?error=save_failed");
  }

  const companyContact = await getCompanyContactData();

  await safeRecordOperationalEvent(
    {
      userId: user?.id ?? null,
      scope: "contact",
      eventType: "contact_message_submitted",
      entityType: "contact_message",
      entityId: insertedMessage?.id,
      title: "Yangi contact form yuborildi",
      detail: {
        subject,
        senderEmail: email,
      },
      dedupeKey: insertedMessage?.id
        ? `contact:${insertedMessage.id}:submitted`
        : undefined,
    },
    { preferAdmin: true }
  );

  await safeQueueNotificationJob(
    {
      channel: "email",
      eventType: "contact_message_support_alert",
      recipient: companyContact.email,
      subject: `Yangi murojaat: ${subject}`,
      templateKey: "contact_message_support_alert",
      payload: {
        name,
        email,
        subject,
        message,
      },
      dedupeKey: insertedMessage?.id
        ? `contact:${insertedMessage.id}:support-alert`
        : undefined,
      provider: "provider_pending",
    },
    { preferAdmin: true }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user?.id ?? null,
      email,
      eventType: "contact_message_acknowledged",
      subject: "Murojaatingiz qabul qilindi",
      payload: {
        subject,
        supportEmail: companyContact.email,
      },
      dedupeKey: insertedMessage?.id
        ? `contact:${insertedMessage.id}:user-ack`
        : undefined,
      force: true,
    },
    { preferAdmin: true }
  );

  revalidatePath("/admin/messages");
  revalidatePath("/admin/operations");
  redirect("/contact?sent=1");
}
