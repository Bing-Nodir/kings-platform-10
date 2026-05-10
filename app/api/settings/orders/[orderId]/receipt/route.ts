import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";

function formatCurrency(amount: number | null) {
  return `${(amount ?? 0).toLocaleString("uz-UZ")} so'm`;
}

function buildReceiptFileName(orderId: string) {
  return `kings-receipt-${orderId.slice(0, 8)}.txt`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, item_id, item_title, item_type, amount, status, payment_method, payment_reference, status_detail, created_at, paid_at, customer_name, customer_phone"
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Buyurtma topilmadi." }, { status: 404 });
  }

  const enrollment =
    order.item_type === "course" && order.item_id
      ? await supabase
          .from("enrollments")
          .select("id, enrolled_at, progress_percent")
          .eq("user_id", user.id)
          .eq("course_id", order.item_id)
          .maybeSingle()
      : { data: null };

  const receiptLines = [
    "Kings Education Platform",
    "Payment receipt",
    "----------------------------------------",
    `Receipt generated at: ${new Date().toLocaleString("uz-UZ")}`,
    `Order ID: ${order.id}`,
    `Customer: ${order.customer_name ?? "Mavjud emas"}`,
    `Email: ${user.email ?? "Mavjud emas"}`,
    `Phone: ${order.customer_phone ?? "Mavjud emas"}`,
    `Item: ${order.item_title ?? "Noma'lum buyurtma"}`,
    `Type: ${order.item_type === "product" ? "Product" : "Course"}`,
    `Amount: ${formatCurrency(order.amount)}`,
    `Status: ${order.status}`,
    `Payment method: ${order.payment_method ?? "Aniqlanmagan"}`,
    `Payment reference: ${order.payment_reference ?? "Hali berilmagan"}`,
    `Order created: ${new Date(order.created_at).toLocaleString("uz-UZ")}`,
    `Paid at: ${order.paid_at ? new Date(order.paid_at).toLocaleString("uz-UZ") : "Tasdiq kutilmoqda"}`,
    `Status detail: ${order.status_detail ?? "Mavjud emas"}`,
    `Access granted: ${enrollment.data ? "Ha" : "Yo'q"}`,
    `Enrollment progress: ${enrollment.data?.progress_percent ?? 0}%`,
    `Enrollment started: ${
      enrollment.data?.enrolled_at
        ? new Date(enrollment.data.enrolled_at).toLocaleString("uz-UZ")
        : "Mavjud emas"
    }`,
  ];

  return new NextResponse(receiptLines.join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${buildReceiptFileName(order.id)}"`,
      "cache-control": "no-store",
    },
  });
}
