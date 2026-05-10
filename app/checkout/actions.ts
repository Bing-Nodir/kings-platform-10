"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import { createPendingCheckoutOrder } from "@/lib/server/payments";
import {
  coercePaymentMethod,
  isValidPhone,
  normalizeSingleLine,
} from "@/lib/server/validation";
import { createClient } from "@/utils/supabase/server";

function isBackendPolicyError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42501" ||
    error?.message?.toLowerCase().includes("row-level security") ||
    error?.message?.toLowerCase().includes("permission")
  );
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const itemType = formData.get("type") === "product" ? "product" : "course";
  const itemId = normalizeSingleLine(formData.get("id"), 120);

  if (!user) {
    const redirectTarget = `/checkout?type=${itemType}&id=${encodeURIComponent(itemId)}`;
    redirect(
      `/login?${new URLSearchParams({
        redirect: redirectTarget,
        message:
          itemType === "course"
            ? "Kursga yozilish uchun avval tizimga kiring."
            : "Xarid qilish uchun avval tizimga kiring.",
      }).toString()}`
    );
  }

  const paymentMethod = coercePaymentMethod(formData.get("payment_method"));
  const fullName = normalizeSingleLine(formData.get("full_name"), 100);
  const phone = normalizeSingleLine(formData.get("phone"), 20);

  if (!itemId || !itemType || !paymentMethod || !fullName || !phone) {
    redirect(`/checkout?type=${itemType}&id=${itemId}&error=missing_fields`);
  }

  if (fullName.length < 3 || !isValidPhone(phone)) {
    redirect(`/checkout?type=${itemType}&id=${itemId}&error=missing_fields`);
  }

  const result = await createPendingCheckoutOrder({
    supabase,
    userId: user.id,
    userEmail: user.email,
    itemId,
    itemType,
    paymentMethod,
    customerName: fullName,
    customerPhone: phone,
  });

  if (!result.ok) {
    if (result.reason === "redirect" && result.redirectPath) {
      redirect(result.redirectPath);
    }

    if (
      result.reason === "setup_required" ||
      isBackendPolicyError(result.error ?? null)
    ) {
      redirect(
        `/checkout?type=${itemType}&id=${itemId}&error=backend_setup_required`
      );
    }

    redirect(
      `/checkout?type=${itemType}&id=${itemId}&error=${
        result.reason === "payment_intent_failed" ? "payment_intent_failed" : "order_failed"
      }`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/settings/billing");
  revalidatePath("/admin/operations");
  if (itemType === "course") {
    revalidatePath(`/courses/${itemId}`);
    revalidatePath(`/courses/${itemId}/watch`);
  } else {
    revalidatePath("/shop");
  }

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "payment",
      eventType: "payment_intent_created",
      entityType: "order",
      entityId: result.order.id,
      title: "Checkout payment intent yaratildi",
      detail: {
        itemType,
        itemId,
        paymentIntentId: result.paymentIntent.id,
        paymentMethod,
      },
      dedupeKey: `payment:${result.paymentIntent.id}:created`,
    },
    { supabase }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: user.email,
      eventType: "payment_intent_created",
      subject: "To'lov jarayoni boshlandi",
      payload: {
        orderId: result.order.id,
        itemType,
        itemId,
        paymentMethod,
      },
      dedupeKey: `payment:${result.paymentIntent.id}:created:email`,
    },
    { supabase }
  );

  redirect(
    `/checkout/success?orderId=${result.order.id}&paymentIntentId=${result.paymentIntent.id}&itemId=${itemId}`
  );
}
