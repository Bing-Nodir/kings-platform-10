import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import { recordSecurityAuditLog } from "@/lib/server/settings";
import {
  isSupportedLanguage,
  isValidPhone,
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";

export async function PUT(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    full_name?: string;
    phone?: string;
    bio?: string;
    company_name?: string;
    language_pref?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }

  const updates: Record<string, string> = {};

  if (typeof body.full_name === "string") {
    const fullName = normalizeSingleLine(body.full_name, 100);

    if (!fullName) {
      return NextResponse.json(
        { error: "To'liq ism bo'sh bo'lishi mumkin emas" },
        { status: 400 }
      );
    }

    updates.full_name = fullName;
  }

  if (typeof body.phone === "string") {
    const phone = normalizeSingleLine(body.phone, 20);

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Telefon raqami noto'g'ri formatda" },
        { status: 400 }
      );
    }

    updates.phone = phone;
  }

  if (typeof body.bio === "string") {
    updates.bio = normalizeMultiline(body.bio, 500);
  }

  if (typeof body.company_name === "string") {
    updates.company_name = normalizeSingleLine(body.company_name, 100);
  }

  if (typeof body.language_pref === "string") {
    if (!isSupportedLanguage(body.language_pref)) {
      return NextResponse.json(
        { error: "Til qiymati noto'g'ri" },
        { status: 400 }
      );
    }

    updates.language_pref = body.language_pref;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Yangilash uchun hech qanday maydon yuborilmadi" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordSecurityAuditLog(
    user.id,
    "profile_updated",
    { changedFields: Object.keys(updates) },
    supabase
  );

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "security",
      eventType: "profile_updated",
      entityType: "profile",
      entityId: user.id,
      title: "Profil ma'lumotlari yangilandi",
      detail: {
        changedFields: Object.keys(updates),
      },
      dedupeKey: `profile:${user.id}:${Object.keys(updates).sort().join("-")}`,
    },
    { supabase }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: user.email,
      eventType: "profile_updated",
      subject: "Profil ma'lumotlari yangilandi",
      payload: {
        changedFields: Object.keys(updates),
      },
      dedupeKey: `profile:${user.id}:${Object.keys(updates).sort().join("-")}:email`,
    },
    { supabase }
  );

  return NextResponse.json({ ok: true });
}
