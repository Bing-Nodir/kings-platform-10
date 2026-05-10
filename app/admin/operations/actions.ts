"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/server/auth";
import type { NotificationJobStatus } from "@/lib/server/operations";

const VALID_STATUSES = new Set<NotificationJobStatus>([
  "queued",
  "processing",
  "sent",
  "failed",
  "cancelled",
]);

export async function updateNotificationJobStatus(
  jobId: string,
  status: NotificationJobStatus
) {
  if (!jobId || !VALID_STATUSES.has(status)) {
    return { error: "Noto'g'ri status" };
  }

  try {
    const { supabase } = await requireAdminContext();

    const updates: Record<string, string | number | null> = {
      status,
      attempts: status === "processing" ? 1 : 0,
      last_attempt_at: new Date().toISOString(),
    };

    if (status === "sent") {
      updates.sent_at = new Date().toISOString();
      updates.error_detail = null;
    }

    if (status === "failed") {
      updates.error_detail = "Admin tomonidan failed deb belgilandi";
    }

    if (status === "cancelled") {
      updates.error_detail = "Admin tomonidan cancelled deb belgilandi";
    }

    const { error } = await supabase
      .from("notification_jobs")
      .update(updates)
      .eq("id", jobId);

    if (error) return { error: error.message };

    revalidatePath("/admin/operations");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { error: "Ruxsat yo'q" };
  }
}
