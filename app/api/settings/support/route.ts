import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCompanyContactData } from "@/lib/content-store";
import { getAuthenticatedContext } from "@/lib/server/auth";
import {
  safeQueueNotificationJob,
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_SOURCES,
} from "@/lib/server/support";
import {
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit";

function isSupportSource(value: unknown) {
  return SUPPORT_SOURCES.includes(
    value as (typeof SUPPORT_SOURCES)[number]
  );
}

function isSupportCategory(value: unknown) {
  return SUPPORT_CATEGORIES.includes(
    value as (typeof SUPPORT_CATEGORIES)[number]
  );
}

function isMissingSupportSchema(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42703" ||
    error?.message?.toLowerCase().includes("column") === true
  );
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    getRateLimitKey(request, "settings-support", user.id),
    {
      limit: 6,
      windowMs: 10 * 60_000,
    }
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Support so'rovlari limiti oshib ketdi. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        category?: string;
        message?: string;
        orderId?: string | null;
        source?: string;
        subject?: string;
      }
    | null;

  const rawCategory = body?.category;
  const rawSource = body?.source;
  const category = isSupportCategory(rawCategory) ? rawCategory : "general";
  const source = isSupportSource(rawSource) ? rawSource : "settings_support";
  const subject = normalizeSingleLine(body?.subject, 120);
  const message = normalizeMultiline(body?.message, 3000);
  const orderId =
    typeof body?.orderId === "string" && body.orderId.trim().length > 0
      ? body.orderId.trim()
      : null;

  if (!subject || subject.length < 5) {
    return NextResponse.json(
      { error: "Mavzu kamida 5 belgidan iborat bo'lsin." },
      { status: 400 }
    );
  }

  if (!message || message.length < 20) {
    return NextResponse.json(
      { error: "Murojaat tafsiloti kamida 20 belgidan iborat bo'lsin." },
      { status: 400 }
    );
  }

  let relatedOrder:
    | {
        id: string;
        item_title: string | null;
        item_type: string | null;
        status: string | null;
        amount: number | null;
        payment_method: string | null;
      }
    | null = null;

  if (orderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, item_title, item_type, status, amount, payment_method")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { error: "Bog'langan buyurtma topilmadi." },
        { status: 404 }
      );
    }

    relatedOrder = order;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const contactName =
    normalizeSingleLine(profile?.full_name, 80) ||
    user.email?.split("@")[0] ||
    "Foydalanuvchi";
  const contactEmail = profile?.email ?? user.email ?? "";

  if (!contactEmail) {
    return NextResponse.json(
      { error: "Account email topilmadi." },
      { status: 400 }
    );
  }

  const { data: insertedMessage, error } = await supabase
    .from("contact_messages")
    .insert({
      user_id: user.id,
      name: contactName,
      email: contactEmail,
      subject,
      message,
      source,
      category,
      related_order_id: relatedOrder?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: isMissingSupportSchema(error)
          ? "Phase 3 support migratsiyasi hali bazaga qo'llanmagan."
          : error.message,
      },
      { status: 500 }
    );
  }

  const companyContact = await getCompanyContactData();

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "support",
      eventType: "support_ticket_created",
      entityType: "contact_message",
      entityId: insertedMessage.id,
      title: "Settings orqali support so'rovi yuborildi",
      detail: {
        category,
        source,
        relatedOrderId: relatedOrder?.id ?? null,
        relatedOrderTitle: relatedOrder?.item_title ?? null,
      },
      dedupeKey: `support:${insertedMessage.id}:created`,
    },
    { preferAdmin: true }
  );

  await safeQueueNotificationJob(
    {
      channel: "email",
      eventType: "support_ticket_alert",
      recipient: companyContact.email,
      subject: `Yangi support ticket: ${subject}`,
      templateKey: "support_ticket_alert",
      payload: {
        category,
        source,
        contactName,
        contactEmail,
        subject,
        message,
        relatedOrder,
      },
      dedupeKey: `support:${insertedMessage.id}:support-alert`,
      provider: "provider_pending",
    },
    { preferAdmin: true }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: contactEmail,
      eventType: "support_ticket_acknowledged",
      subject: "Support so'rovingiz qabul qilindi",
      payload: {
        ticketId: insertedMessage.id,
        category,
        source,
        relatedOrderId: relatedOrder?.id ?? null,
        supportEmail: companyContact.email,
      },
      dedupeKey: `support:${insertedMessage.id}:user-ack`,
      force: true,
    },
    { preferAdmin: true }
  );

  revalidatePath("/settings/billing");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/operations");

  return NextResponse.json({
    ok: true,
    ticket: {
      id: insertedMessage.id,
      category,
      source,
      relatedOrderId: relatedOrder?.id ?? null,
    },
  });
}
