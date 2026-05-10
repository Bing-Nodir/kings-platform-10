import { getCourseByIdData, getProductByIdData } from "@/lib/content-store"
import {
  applyPricingPenalty,
  getStudentReputation,
} from "@/lib/server/student-reputation"
import type { PaymentMethod } from "@/lib/server/validation"
import { createClient } from "@/utils/supabase/server"

export const PAYMENT_INTENT_STATUSES = [
  "pending_confirmation",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const

export type PaymentIntentStatus = (typeof PAYMENT_INTENT_STATUSES)[number]
export type OrderLifecycleStatus = "pending" | "paid" | "cancelled"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type SupabaseDataClient = {
  from: SupabaseServerClient["from"]
  rpc: SupabaseServerClient["rpc"]
}

interface CheckoutItemResolution {
  amount: number
  baseAmount: number
  creditScore?: number
  discountPercent?: number
  discountRuleId?: string | null
  itemTitle: string
  pricingPenaltyPercent?: number
  redirectPath?: string
}

export function isPaymentIntentStatus(
  value: unknown
): value is PaymentIntentStatus {
  return PAYMENT_INTENT_STATUSES.includes(value as PaymentIntentStatus)
}

export function isSandboxPaymentConfirmationEnabled() {
  return (
    process.env.ALLOW_SANDBOX_PAYMENT_CONFIRMATION === "true" ||
    process.env.NODE_ENV !== "production"
  )
}

export function formatOrderStatusLabel(status: string) {
  if (status === "paid") return "To'langan"
  if (status === "cancelled") return "Bekor qilingan"
  return "Kutilmoqda"
}

export function formatPaymentIntentStatusLabel(status: string) {
  if (status === "succeeded") return "Tasdiqlangan"
  if (status === "processing") return "Jarayonda"
  if (status === "failed") return "Muvaffaqiyatsiz"
  if (status === "cancelled") return "Bekor qilingan"
  return "Tasdiq kutilmoqda"
}

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return error?.code === "42P01" || error?.message?.toLowerCase().includes("does not exist")
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" || error?.message?.toLowerCase().includes("column")
}

export function isPaymentInfrastructureError(
  error: { code?: string; message?: string } | null
) {
  return isMissingRelationError(error) || isMissingColumnError(error)
}

async function applyDynamicPricing(
  supabase: SupabaseDataClient,
  itemType: "course" | "product",
  itemId: string,
  baseAmount: number
) {
  const { data, error } = await supabase.rpc("active_pricing_for_item", {
    p_item_type: itemType,
    p_item_id: itemId,
    p_base_amount: baseAmount,
  })

  if (error || !data || typeof data !== "object") {
    return {
      finalAmount: baseAmount,
      discountPercent: 0,
      discountRuleId: null as string | null,
    }
  }

  const payload = data as {
    finalAmount?: number
    discountPercent?: number
    ruleId?: string | null
  }

  return {
    finalAmount:
      typeof payload.finalAmount === "number" ? payload.finalAmount : baseAmount,
    discountPercent:
      typeof payload.discountPercent === "number" ? payload.discountPercent : 0,
    discountRuleId: payload.ruleId ?? null,
  }
}

async function resolveCheckoutItem(
  supabase: SupabaseDataClient,
  userId: string,
  itemId: string,
  itemType: "course" | "product"
): Promise<CheckoutItemResolution> {
  if (itemType === "course") {
    const course = await getCourseByIdData(itemId)
    if (!course) {
      return { amount: 0, baseAmount: 0, itemTitle: "", redirectPath: "/courses" }
    }

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", itemId)
      .maybeSingle()

    if (existing) {
      return {
        amount: course.price,
        baseAmount: course.price,
        itemTitle: course.title,
        redirectPath: `/courses/${itemId}/watch`,
      }
    }

    const reputation = await getStudentReputation(userId, supabase)
    const pricing = await applyDynamicPricing(
      supabase,
      "course",
      itemId,
      course.price
    )
    const amount = applyPricingPenalty(
      pricing.finalAmount,
      reputation.pricingPenaltyPercent
    )

    return {
      amount,
      baseAmount: course.price,
      creditScore: reputation.creditScore,
      discountPercent: pricing.discountPercent,
      discountRuleId: pricing.discountRuleId,
      itemTitle: course.title,
      pricingPenaltyPercent: reputation.pricingPenaltyPercent,
    }
  }

  const product = await getProductByIdData(itemId)
  if (!product || !product.inStock) {
    return { amount: 0, baseAmount: 0, itemTitle: "", redirectPath: "/shop" }
  }

  const pricing = await applyDynamicPricing(
    supabase,
    "product",
    itemId,
    product.price
  )

  return {
    amount: pricing.finalAmount,
    baseAmount: product.price,
    discountPercent: pricing.discountPercent,
    discountRuleId: pricing.discountRuleId,
    itemTitle: product.name,
  }
}

export async function createPendingCheckoutOrder(options: {
  supabase: SupabaseDataClient
  userId: string
  userEmail: string | null | undefined
  itemId: string
  itemType: "course" | "product"
  paymentMethod: PaymentMethod
  customerName: string
  customerPhone: string
}) {
  const {
    supabase,
    userId,
    userEmail,
    itemId,
    itemType,
    paymentMethod,
    customerName,
    customerPhone,
  } = options

  const item = await resolveCheckoutItem(supabase, userId, itemId, itemType)

  if (item.redirectPath) {
    return {
      ok: false as const,
      reason: "redirect",
      redirectPath: item.redirectPath,
    }
  }

  const orderInsert = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      user_email: userEmail,
      item_id: itemId,
      item_title: item.itemTitle,
      item_type: itemType,
      amount: item.amount,
      status: "pending",
      status_detail: "awaiting:checkout_created",
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_phone: customerPhone,
    })
    .select("id, item_id, item_title, item_type, amount, status")
    .single()

  if (orderInsert.error || !orderInsert.data) {
    return {
      ok: false as const,
      reason: isPaymentInfrastructureError(orderInsert.error)
        ? "setup_required"
        : "order_failed",
      error: orderInsert.error,
    }
  }

  const paymentIntentInsert = await supabase
    .from("payment_intents")
    .insert({
      order_id: orderInsert.data.id,
      user_id: userId,
      provider: paymentMethod,
      payment_method: paymentMethod,
      status: "pending_confirmation",
      amount: item.amount,
      currency: "UZS",
      status_detail: "checkout_created",
      provider_payload: {
        itemId,
        itemType,
        baseAmount: item.baseAmount,
        checkoutOrigin: "web_checkout",
        creditScore: item.creditScore ?? null,
        discountPercent: item.discountPercent ?? 0,
        discountRuleId: item.discountRuleId ?? null,
        pricingPenaltyPercent: item.pricingPenaltyPercent ?? 0,
      },
    })
    .select("id, status, checkout_token")
    .single()

  if (paymentIntentInsert.error || !paymentIntentInsert.data) {
    return {
      ok: false as const,
      reason: isPaymentInfrastructureError(paymentIntentInsert.error)
        ? "setup_required"
        : "payment_intent_failed",
      orderId: orderInsert.data.id,
      error: paymentIntentInsert.error,
    }
  }

  return {
    ok: true as const,
    order: orderInsert.data,
    paymentIntent: paymentIntentInsert.data,
  }
}

export async function getOrderPaymentView(
  orderId: string,
  userId: string,
  supabase?: SupabaseDataClient
) {
  const db = supabase ?? (await createClient())

  const { data: order } = await db
    .from("orders")
    .select(
      "id, item_id, item_title, item_type, amount, status, payment_method, payment_reference, status_detail, paid_at, fulfilled_at, created_at, last_payment_intent_id"
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle()

  if (!order) {
    return null
  }

  const { data: latestIntent } = await db
    .from("payment_intents")
    .select(
      "id, status, provider, payment_method, provider_reference, status_detail, confirmed_at, cancelled_at, created_at"
    )
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    order,
    paymentIntent: latestIntent,
  }
}

export async function confirmPaymentIntentForUser(options: {
  paymentIntentId: string
  source: string
  providerReference?: string
  detail?: Record<string, unknown>
  supabase?: SupabaseDataClient
}) {
  const db = options.supabase ?? (await createClient())

  return db.rpc("confirm_payment_intent", {
    p_intent_id: options.paymentIntentId,
    p_status: "succeeded",
    p_source: options.source,
    p_provider_reference: options.providerReference ?? null,
    p_detail: options.detail ?? {},
  })
}

export async function transitionPaymentIntent(options: {
  paymentIntentId: string
  status: PaymentIntentStatus
  source: string
  providerReference?: string
  detail?: Record<string, unknown>
  supabase?: SupabaseDataClient
}) {
  const db = options.supabase ?? (await createClient())

  return db.rpc("confirm_payment_intent", {
    p_intent_id: options.paymentIntentId,
    p_status: options.status,
    p_source: options.source,
    p_provider_reference: options.providerReference ?? null,
    p_detail: options.detail ?? {},
  })
}
