import { NextResponse } from "next/server"
import { getAuthenticatedContext } from "@/lib/server/auth"
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations"
import {
  confirmPaymentIntentForUser,
  getOrderPaymentView,
  isSandboxPaymentConfirmationEnabled,
} from "@/lib/server/payments"
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit"

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedContext()

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 })
  }

  const rateLimit = checkRateLimit(
    getRateLimitKey(request, "payment-confirm", user.id),
    {
      limit: 10,
      windowMs: 10 * 60_000,
    }
  )

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Payment tasdiqlash limiti oshib ketdi. Birozdan keyin qayta urinib ko'ring."
    )
  }

  if (!isSandboxPaymentConfirmationEnabled()) {
    return NextResponse.json(
      { error: "Sandbox payment confirmation o'chirilgan." },
      { status: 403 }
    )
  }

  const body = (await request.json().catch(() => null)) as
    | { paymentIntentId?: string; orderId?: string }
    | null

  const paymentIntentId =
    typeof body?.paymentIntentId === "string" ? body.paymentIntentId : ""
  const orderId = typeof body?.orderId === "string" ? body.orderId : ""

  if (!paymentIntentId || !orderId) {
    return NextResponse.json(
      { error: "paymentIntentId va orderId talab qilinadi." },
      { status: 400 }
    )
  }

  const view = await getOrderPaymentView(orderId, user.id, supabase)

  if (!view || view.paymentIntent?.id !== paymentIntentId) {
    return NextResponse.json({ error: "Payment topilmadi." }, { status: 404 })
  }

  const providerReference = `sandbox-${Date.now()}`
  const { error } = await confirmPaymentIntentForUser({
    paymentIntentId,
    source: "sandbox_api",
    providerReference,
    detail: {
      confirmedBy: user.id,
      mode: "sandbox",
    },
    supabase,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "payment",
      eventType: "payment_confirmed",
      entityType: "order",
      entityId: orderId,
      title: "Payment sandbox orqali tasdiqlandi",
      detail: {
        paymentIntentId,
        providerReference,
      },
      dedupeKey: `payment:${paymentIntentId}:confirmed`,
    },
    { supabase }
  )

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: user.email,
      eventType: "payment_confirmed",
      subject: "To'lov tasdiqlandi",
      payload: {
        orderId,
        paymentIntentId,
        providerReference,
        itemTitle: view.order.item_title,
      },
      dedupeKey: `payment:${paymentIntentId}:confirmed:email`,
      force: true,
    },
    { supabase }
  )

  return NextResponse.json({
    ok: true,
    providerReference,
  })
}
