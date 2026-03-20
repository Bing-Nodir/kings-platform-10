"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/server/auth";

const allowedStatuses = new Set(["new", "in_review", "resolved"]);

export async function updateMessageStatus(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status || !allowedStatuses.has(status)) {
    return;
  }

  const { supabase } = await requireAdminContext();
  await supabase.from("contact_messages").update({ status }).eq("id", id);

  revalidatePath("/admin/messages");
}
