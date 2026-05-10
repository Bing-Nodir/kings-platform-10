import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import {
  DEFAULT_USER_PREFERENCES,
  getUserPreferences,
  recordSecurityAuditLog,
} from "@/lib/server/settings";
import { THEME_PREFERENCES } from "@/lib/theme";
import { isSupportedLanguage } from "@/lib/server/validation";

function isThemePreference(value: unknown): value is (typeof THEME_PREFERENCES)[number] {
  return THEME_PREFERENCES.includes(value as (typeof THEME_PREFERENCES)[number]);
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const preferences = await getUserPreferences(user.id, supabase);
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    theme_pref?: string;
    language_pref?: string;
    email_notifications?: boolean;
    push_notifications?: boolean;
    marketing_notifications?: boolean;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }

  const preferenceUpdates: Record<string, string | boolean> = {};
  const changedFields: string[] = [];

  if (typeof body.theme_pref === "string") {
    if (!isThemePreference(body.theme_pref)) {
      return NextResponse.json({ error: "Theme qiymati noto'g'ri" }, { status: 400 });
    }

    preferenceUpdates.theme_pref = body.theme_pref;
    changedFields.push("theme_pref");
  }

  if (typeof body.email_notifications === "boolean") {
    preferenceUpdates.email_notifications = body.email_notifications;
    changedFields.push("email_notifications");
  }

  if (typeof body.push_notifications === "boolean") {
    preferenceUpdates.push_notifications = body.push_notifications;
    changedFields.push("push_notifications");
  }

  if (typeof body.marketing_notifications === "boolean") {
    preferenceUpdates.marketing_notifications = body.marketing_notifications;
    changedFields.push("marketing_notifications");
  }

  if (typeof body.language_pref === "string") {
    if (!isSupportedLanguage(body.language_pref)) {
      return NextResponse.json({ error: "Til qiymati noto'g'ri" }, { status: 400 });
    }
  }

  if (
    Object.keys(preferenceUpdates).length === 0 &&
    typeof body.language_pref !== "string"
  ) {
    return NextResponse.json(
      { error: "Yangilash uchun hech qanday maydon yuborilmadi" },
      { status: 400 }
    );
  }

  if (Object.keys(preferenceUpdates).length > 0) {
    const merged = {
      ...DEFAULT_USER_PREFERENCES,
      ...(await getUserPreferences(user.id, supabase)),
      ...preferenceUpdates,
    };

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        theme_pref: merged.theme_pref,
        email_notifications: merged.email_notifications,
        push_notifications: merged.push_notifications,
        marketing_notifications: merged.marketing_notifications,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return NextResponse.json(
        {
          error:
            error.code === "42P01"
              ? "user_preferences jadvali hali yaratilmagan. Migration SQL ni ishga tushiring."
              : error.message,
        },
        { status: 500 }
      );
    }
  }

  if (typeof body.language_pref === "string") {
    const { error } = await supabase
      .from("profiles")
      .update({ language_pref: body.language_pref })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    changedFields.push("language_pref");
  }

  await recordSecurityAuditLog(
    user.id,
    "preferences_updated",
    { changedFields },
    supabase
  );

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "security",
      eventType: "preferences_updated",
      entityType: "user_preferences",
      entityId: user.id,
      title: "Preferences yangilandi",
      detail: {
        changedFields,
      },
      dedupeKey: `preferences:${user.id}:${changedFields.sort().join("-")}`,
    },
    { supabase }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: user.email,
      eventType: "preferences_updated",
      subject: "Sozlamalar yangilandi",
      payload: {
        changedFields,
      },
      dedupeKey: `preferences:${user.id}:${changedFields.sort().join("-")}:email`,
    },
    { supabase }
  );

  const preferences = await getUserPreferences(user.id, supabase);
  return NextResponse.json({ ok: true, preferences });
}
