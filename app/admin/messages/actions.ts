"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";

const allowedStatuses = new Set(["new", "in_review", "resolved"]);

export async function updateMessageStatus(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status || !allowedStatuses.has(status)) {
    return;
  }

  const { supabase } = await requireAdminContext();
  const { data: message } = await supabase
    .from("contact_messages")
    .select("id, user_id, email, subject")
    .eq("id", id)
    .maybeSingle();

  const updatePayload = {
    status,
    resolved_at: status === "resolved" ? new Date().toISOString() : null,
  };

  const updateResult = await supabase
    .from("contact_messages")
    .update(updatePayload)
    .eq("id", id);

  if (
    updateResult.error?.code === "42703" ||
    updateResult.error?.message?.toLowerCase().includes("column")
  ) {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin/operations");
  revalidatePath("/settings/billing");

  await safeRecordOperationalEvent(
    {
      userId: message?.user_id ?? null,
      scope: "support",
      eventType: `contact_message_${status}`,
      entityType: "contact_message",
      entityId: id,
      title: "Murojaat statusi yangilandi",
      detail: {
        status,
        subject: message?.subject,
      },
      dedupeKey: `contact:${id}:status:${status}`,
    },
    { supabase }
  );

  if (status === "resolved") {
    await safeQueueUserEmailNotification(
      {
        userId: message?.user_id ?? null,
        email: message?.email ?? null,
        eventType: "contact_message_resolved",
        subject: "Murojaatingiz ko'rib chiqildi",
        payload: {
          messageId: id,
          subject: message?.subject,
        },
        dedupeKey: `contact:${id}:resolved:email`,
        force: true,
      },
      { supabase }
    );
  }
}
