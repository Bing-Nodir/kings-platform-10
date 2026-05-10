import type { SupportedLanguage } from "@/lib/server/validation";
import { THEME_PREFERENCES, type ThemePreference } from "@/lib/theme";
import { createClient } from "@/utils/supabase/server";

export interface UserPreferenceRecord {
  theme_pref: ThemePreference;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_notifications: boolean;
  language_pref: SupportedLanguage;
  updated_at: string | null;
}

export interface SecurityAuditLog {
  id: string;
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferenceRecord = {
  theme_pref: "system",
  email_notifications: true,
  push_notifications: false,
  marketing_notifications: false,
  language_pref: "uz",
  updated_at: null,
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function getDbClient(supabase?: SupabaseServerClient) {
  return supabase ?? createClient();
}

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

export async function getUserPreferences(
  userId: string,
  supabase?: SupabaseServerClient
): Promise<UserPreferenceRecord> {
  const db = await getDbClient(supabase);

  const [{ data: preference }, { data: profile }] = await Promise.all([
    db
      .from("user_preferences")
      .select(
        "theme_pref, email_notifications, push_notifications, marketing_notifications, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle(),
    db.from("profiles").select("language_pref").eq("id", userId).maybeSingle(),
  ]);

  return {
    theme_pref: isThemePreference(preference?.theme_pref)
      ? preference.theme_pref
      : DEFAULT_USER_PREFERENCES.theme_pref,
    email_notifications:
      preference?.email_notifications ??
      DEFAULT_USER_PREFERENCES.email_notifications,
    push_notifications:
      preference?.push_notifications ?? DEFAULT_USER_PREFERENCES.push_notifications,
    marketing_notifications:
      preference?.marketing_notifications ??
      DEFAULT_USER_PREFERENCES.marketing_notifications,
    language_pref:
      (profile?.language_pref as SupportedLanguage | undefined) ??
      DEFAULT_USER_PREFERENCES.language_pref,
    updated_at: preference?.updated_at ?? null,
  };
}

export async function getSecurityAuditLogs(
  userId: string,
  options?: { limit?: number },
  supabase?: SupabaseServerClient
): Promise<SecurityAuditLog[]> {
  const db = await getDbClient(supabase);
  const limit = options?.limit ?? 10;

  const { data } = await db
    .from("security_audit_logs")
    .select("id, action, detail, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    detail:
      row.detail && typeof row.detail === "object" && !Array.isArray(row.detail)
        ? (row.detail as Record<string, unknown>)
        : {},
    created_at: row.created_at,
  }));
}

export async function recordSecurityAuditLog(
  userId: string,
  action: string,
  detail: Record<string, unknown> = {},
  supabase?: SupabaseServerClient
) {
  const db = await getDbClient(supabase);

  await db.from("security_audit_logs").insert({
    user_id: userId,
    action,
    detail,
  });
}
