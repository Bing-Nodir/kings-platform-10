import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { safeRecordOperationalEvent } from "@/lib/server/operations";
import { getSecurityAuditLogs, getUserPreferences } from "@/lib/server/settings";
import { getUserSupportTickets } from "@/lib/server/support";

function buildExportFileName(userId: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `kings-account-export-${userId.slice(0, 8)}-${date}.json`;
}

async function getOptionalInstructorSubmissions(
  userId: string,
  supabase: Awaited<ReturnType<typeof getAuthenticatedContext>>["supabase"]
) {
  const { data, error } = await supabase
    .from("course_submissions")
    .select(
      "id, slug, title, category, status, submitted_at, reviewed_at, created_at, updated_at"
    )
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const [
    { data: profile },
    preferences,
    securityLogs,
    supportState,
    { data: orders },
    { data: enrollments },
    instructorSubmissions,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, email, phone, bio, company_name, role, language_pref, created_at, updated_at"
      )
      .eq("id", user.id)
      .maybeSingle(),
    getUserPreferences(user.id, supabase),
    getSecurityAuditLogs(user.id, { limit: 50 }, supabase),
    getUserSupportTickets(user.id, supabase),
    supabase
      .from("orders")
      .select(
        "id, item_type, item_title, amount, status, payment_method, payment_reference, status_detail, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("enrollments")
      .select("id, course_id, order_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    getOptionalInstructorSubmissions(user.id, supabase),
  ]);

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "security",
      eventType: "account_export_downloaded",
      entityType: "profile",
      entityId: user.id,
      title: "Account export yuklab olindi",
      detail: {
        exportedAt: new Date().toISOString(),
      },
      dedupeKey: undefined,
    },
    { supabase }
  );

  const payload = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
    },
    profile: profile ?? null,
    preferences,
    security_audit_logs: securityLogs,
    support_tickets: supportState.tickets,
    orders: orders ?? [],
    enrollments: enrollments ?? [],
    instructor_submissions: instructorSubmissions,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${buildExportFileName(user.id)}"`,
      "cache-control": "no-store",
    },
  });
}
