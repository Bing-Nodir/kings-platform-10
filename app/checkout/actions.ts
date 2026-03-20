"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCourseById, getProductById } from "@/lib/catalog";
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

function errorMentions(
  error: { message?: string; details?: string; hint?: string } | null,
  value: string
) {
  const combined = [error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return combined.includes(value.toLowerCase());
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const itemType = formData.get("type") === "product" ? "product" : "course";
  const itemId = normalizeSingleLine(formData.get("id"), 120);
  const paymentMethod = coercePaymentMethod(formData.get("payment_method"));
  const fullName = normalizeSingleLine(formData.get("full_name"), 100);
  const phone = normalizeSingleLine(formData.get("phone"), 20);

  if (!itemId || !itemType || !paymentMethod || !fullName || !phone) {
    redirect(`/checkout?type=${itemType}&id=${itemId}&error=missing_fields`);
  }

  if (fullName.length < 3 || !isValidPhone(phone)) {
    redirect(`/checkout?type=${itemType}&id=${itemId}&error=missing_fields`);
  }

  let amount = 0;
  let itemTitle = "";

  if (itemType === "course") {
    const course = getCourseById(itemId);
    if (!course) redirect("/courses");

    amount = course.price;
    itemTitle = course.title;

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", itemId)
      .maybeSingle();

    if (existing) redirect(`/courses/${itemId}/watch`);
  }

  if (itemType === "product") {
    const product = getProductById(itemId);
    if (!product || !product.inStock) redirect("/shop");

    amount = product.price;
    itemTitle = product.name;
  }

  const orderPayload = {
    user_id: user.id,
    user_email: user.email,
    item_id: itemId,
    item_title: itemTitle,
    item_type: itemType,
    amount,
    status: "paid" as const,
    payment_method: paymentMethod,
    customer_name: fullName,
    customer_phone: phone,
  };

  let { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (
    orderError &&
    (errorMentions(orderError, "payment_method") ||
      errorMentions(orderError, "customer_name") ||
      errorMentions(orderError, "customer_phone"))
  ) {
    const fallbackOrder = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        user_email: user.email,
        item_id: itemId,
        item_title: itemTitle,
        item_type: itemType,
        amount,
        status: "paid",
      })
      .select("id")
      .single();

    order = fallbackOrder.data;
    orderError = fallbackOrder.error;
  }

  if (orderError || !order) {
    if (isBackendPolicyError(orderError)) {
      redirect(
        `/checkout?type=${itemType}&id=${itemId}&error=backend_setup_required`
      );
    }

    redirect(`/checkout?type=${itemType}&id=${itemId}&error=order_failed`);
  }

  if (itemType === "course") {
    const { error: enrollmentError } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: itemId,
      progress_percent: 0,
    });

    if (enrollmentError) {
      if (isBackendPolicyError(enrollmentError)) {
        redirect(
          `/checkout?type=${itemType}&id=${itemId}&error=backend_setup_required`
        );
      }

      redirect(`/checkout?type=${itemType}&id=${itemId}&error=enrollment_failed`);
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath(`/courses/${itemId}`);
    revalidatePath(`/courses/${itemId}/watch`);
    redirect(`/checkout/success?orderId=${order.id}&courseId=${itemId}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath("/shop");
  redirect(`/checkout/success?orderId=${order.id}&itemId=${itemId}`);
}
