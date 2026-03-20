"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/server/auth";

const VALID_STATUSES = ["pending", "paid", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Noto'g'ri status" };
  }

  try {
    const { supabase } = await requireAdminContext();

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) return { error: error.message };

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Ruxsat yo'q" };
  }
}
