import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations"
import { isPaymentIntentStatus, transitionPaymentIntent } from "@/lib/server/payments"
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit"
import { createAdminClient } from "@/utils/supabase/admin"

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SHARED_SECRET?.trim()
const VALID_PROVIDERS = ["card", "payme", "click"] as const

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function secretsMatch(providedSecret: string | null, expectedSecret: string) {
  if (!providedSecret) {
    return false
  }

  const provided = Buffer.from(providedSecret)
  const expected = Buffer.from(expectedSecret)

  if (provided.length !== expected.length) {
    timingSafeEqual(expected, expected)
    return false
  }

  return timingSafeEqual(provided, expected)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params

  if (!VALID_PROVIDERS.includes(provider as (typeof VALID_PROVIDERS)[number])) {
    return NextResponse.json({ error: "Noma'lum provider" }, { status: 404 })
  }

  const rateLimit = checkRateLimit(
    getRateLimitKey(request, `payment-webhook:${provider}`),
    {
      limit: 120,
      windowMs: 60_000,
    }
  )

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit)
  }

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "PAYMENT_WEBHOOK_SHARED_SECRET o'rnatilmagan." },
      { status: 503 }
    )
  }

  const providedSecret = request.headers.get("x-kings-payment-secret")

  if (!secretsMatch(providedSecret, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        paymentIntentId?: string
        status?: string
        providerReference?: string
        detail?: Record<string, unknown>
      }
    | null

  const paymentIntentId =
    typeof body?.paymentIntentId === "string" ? body.paymentIntentId : ""
  const status = body?.status
  const providerReference =
    typeof body?.providerReference === "string" ? body.providerReference : undefined

  if (!paymentIntentId || !isPaymentIntentStatus(status)) {
    return NextResponse.json(
      { error: "paymentIntentId va valid status talab qilinadi." },
      { status: 400 }
    )
  }

  let adminSupabase

  try {
    adminSupabase = createAdminClient()
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Supabase admin client tayyor emas.",
      },
      { status: 503 }
    )
  }

  const { error, data } = await transitionPaymentIntent({
    paymentIntentId,
    status,
    source: `${provider}_webhook`,
    providerReference,
    detail: body?.detail ?? {},
    supabase: adminSupabase,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: paymentIntent } = await adminSupabase
    .from("payment_intents")
    .select("id, user_id, order_id")
    .eq("id", paymentIntentId)
    .maybeSingle()

  const { data: order } = await adminSupabase
    .from("orders")
    .select("id, user_email, item_title")
    .eq("id", paymentIntent?.order_id ?? "")
    .maybeSingle()

  await safeRecordOperationalEvent(
    {
      userId: paymentIntent?.user_id ?? null,
      scope: "payment",
      eventType: `payment_${status}`,
      entityType: "order",
      entityId: paymentIntent?.order_id ?? paymentIntentId,
      title: `${provider} webhook holatni yangiladi`,
      detail: {
        provider,
        paymentIntentId,
        providerReference,
      },
      dedupeKey: `payment:${paymentIntentId}:${status}:${provider}`,
    },
    { supabase: adminSupabase }
  )

  if (status === "succeeded") {
    await safeQueueUserEmailNotification(
      {
        userId: paymentIntent?.user_id ?? null,
        email: order?.user_email ?? null,
        eventType: "payment_confirmed",
        subject: "To'lov tasdiqlandi",
        payload: {
          orderId: order?.id,
          itemTitle: order?.item_title,
          provider,
          providerReference,
        },
        dedupeKey: `payment:${paymentIntentId}:confirmed:email`,
        force: true,
      },
      { supabase: adminSupabase }
    )
  }

  return NextResponse.json({
    ok: true,
    provider,
    result: data,
  })
}
