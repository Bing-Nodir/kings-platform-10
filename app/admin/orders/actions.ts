"use server";

import { revalidatePath } from "next/cache";
import { requireAdminContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import { transitionPaymentIntent } from "@/lib/server/payments";

const VALID_STATUSES = ["pending", "paid", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Noto'g'ri status" };
  }

  try {
    const { supabase } = await requireAdminContext();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, user_id, user_email, item_title")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) return { error: orderError?.message ?? "Order topilmadi" };

    const { data: latestPaymentIntent } = await supabase
      .from("payment_intents")
      .select("id")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPaymentIntent?.id) {
      const mappedStatus =
        status === "paid"
          ? "succeeded"
          : status === "cancelled"
            ? "cancelled"
            : "pending_confirmation";

      const { error } = await transitionPaymentIntent({
        paymentIntentId: latestPaymentIntent.id,
        status: mappedStatus,
        source: "admin_status_select",
        detail: {
          orderId,
          forcedStatus: status,
        },
        supabase,
      });

      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("orders")
        .update({
          status,
          status_detail: `admin_status_select:${status}`,
        })
        .eq("id", orderId);

      if (error) return { error: error.message };
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/admin/operations");
    revalidatePath("/settings/billing");
    revalidatePath("/checkout/success");

    await safeRecordOperationalEvent(
      {
        userId: order.user_id,
        scope: "payment",
        eventType: `order_status_${status}`,
        entityType: "order",
        entityId: orderId,
        title: "Admin order statusini yangiladi",
        detail: {
          status,
        },
        dedupeKey: `order:${orderId}:status:${status}`,
      },
      { supabase }
    );

    await safeQueueUserEmailNotification(
      {
        userId: order.user_id,
        email: order.user_email,
        eventType: `order_status_${status}`,
        subject:
          status === "paid"
            ? "Buyurtmangiz tasdiqlandi"
            : status === "cancelled"
              ? "Buyurtmangiz bekor qilindi"
              : "Buyurtmangiz ko'rib chiqilmoqda",
        payload: {
          orderId,
          itemTitle: order.item_title,
          status,
        },
        dedupeKey: `order:${orderId}:status:${status}:email`,
        force: status !== "pending",
      },
      { supabase }
    );

    return { ok: true };
  } catch {
    return { error: "Ruxsat yo'q" };
  }
}
