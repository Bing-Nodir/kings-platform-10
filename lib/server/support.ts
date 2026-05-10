import { createClient } from "@/utils/supabase/server";

export const SUPPORT_SOURCES = [
  "contact_form",
  "settings_support",
  "billing_support",
] as const;

export const SUPPORT_CATEGORIES = [
  "general",
  "billing",
  "receipt",
  "technical",
  "account",
  "access",
  "content",
] as const;

export type SupportSource = (typeof SUPPORT_SOURCES)[number];
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

interface SupportTicketRow {
  id: string;
  subject: string;
  message: string;
  status: string;
  source?: string | null;
  category?: string | null;
  related_order_id?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface SupportTicketRecord {
  id: string;
  subject: string;
  message: string;
  status: string;
  source: SupportSource;
  category: SupportCategory;
  relatedOrderId: string | null;
  relatedOrderTitle: string | null;
  relatedOrderStatus: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

function isSupportSource(value: unknown): value is SupportSource {
  return SUPPORT_SOURCES.includes(value as SupportSource);
}

function isSupportCategory(value: unknown): value is SupportCategory {
  return SUPPORT_CATEGORIES.includes(value as SupportCategory);
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42703" ||
    error?.message?.toLowerCase().includes("column") === true
  );
}

function isPermissionError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42501" ||
    error?.message?.toLowerCase().includes("permission") === true ||
    error?.message?.toLowerCase().includes("policy") === true
  );
}

async function getDbClient(supabase?: SupabaseServerClient) {
  return supabase ?? createClient();
}

export function formatSupportSourceLabel(source: string) {
  if (source === "billing_support") return "Billing";
  if (source === "settings_support") return "Settings";
  return "Contact";
}

export function formatSupportCategoryLabel(category: string) {
  if (category === "billing") return "Billing";
  if (category === "receipt") return "Receipt";
  if (category === "technical") return "Texnik";
  if (category === "account") return "Account";
  if (category === "access") return "Access";
  if (category === "content") return "Kontent";
  return "Umumiy";
}

export async function getUserSupportTickets(
  userId: string,
  supabase?: SupabaseServerClient
): Promise<{ tickets: SupportTicketRecord[]; error: string | null }> {
  const db = await getDbClient(supabase);

  let rows: SupportTicketRow[] = [];
  let errorMessage: string | null = null;

  const primary = await db
    .from("contact_messages")
    .select(
      "id, subject, message, status, source, category, related_order_id, resolution_note, resolved_at, created_at, updated_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (primary.error) {
    if (isPermissionError(primary.error)) {
      return {
        tickets: [],
        error:
          "Support tarixini ko'rish uchun Phase 3 migration hali bazaga qo'llanmagan.",
      };
    }

    if (isMissingColumnError(primary.error)) {
      const fallback = await db
        .from("contact_messages")
        .select("id, subject, message, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fallback.error) {
        return { tickets: [], error: fallback.error.message };
      }

      rows = (fallback.data ?? []).map((row) => ({
        ...row,
        source: "contact_form",
        category: "general",
        related_order_id: null,
        resolution_note: null,
        resolved_at: null,
        updated_at: row.created_at,
      }));
    } else {
      errorMessage = primary.error.message;
    }
  } else {
    rows = (primary.data ?? []) as SupportTicketRow[];
  }

  if (errorMessage) {
    return { tickets: [], error: errorMessage };
  }

  const relatedOrderIds = Array.from(
    new Set(
      rows
        .map((row) => row.related_order_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );

  const relatedOrders =
    relatedOrderIds.length > 0
      ? await db
          .from("orders")
          .select("id, item_title, status")
          .in("id", relatedOrderIds)
      : { data: [], error: null };

  const orderMap = new Map(
    (relatedOrders.data ?? []).map((order) => [
      order.id,
      {
        title: order.item_title ?? "Noma'lum buyurtma",
        status: order.status ?? null,
      },
    ])
  );

  return {
    tickets: rows.map((row) => ({
      id: row.id,
      subject: row.subject,
      message: row.message,
      status: row.status,
      source: isSupportSource(row.source) ? row.source : "contact_form",
      category: isSupportCategory(row.category) ? row.category : "general",
      relatedOrderId: row.related_order_id ?? null,
      relatedOrderTitle: row.related_order_id
        ? (orderMap.get(row.related_order_id)?.title ?? "Noma'lum buyurtma")
        : null,
      relatedOrderStatus: row.related_order_id
        ? (orderMap.get(row.related_order_id)?.status ?? null)
        : null,
      resolutionNote: row.resolution_note ?? null,
      resolvedAt: row.resolved_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
    })),
    error: relatedOrders.error?.message ?? null,
  };
}
