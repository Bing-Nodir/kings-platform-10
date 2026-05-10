import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import { recordSecurityAuditLog } from "@/lib/server/settings";

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    newPassword?: string;
    confirmPassword?: string;
  } | null;

  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : "";
  const confirmPassword =
    typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Parol maydonlarini to'ldiring" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Yangi parol kamida 8 ta belgidan iborat bo'lsin" },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "Parollar bir xil emas" },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await recordSecurityAuditLog(
    user.id,
    "password_changed",
    { via: "settings_security_page" },
    supabase
  );

  await safeRecordOperationalEvent(
    {
      userId: user.id,
      scope: "security",
      eventType: "password_changed",
      entityType: "profile",
      entityId: user.id,
      title: "Parol yangilandi",
      detail: {
        via: "settings_security_page",
      },
      dedupeKey: `password:${user.id}:changed`,
    },
    { supabase }
  );

  await safeQueueUserEmailNotification(
    {
      userId: user.id,
      email: user.email,
      eventType: "password_changed",
      subject: "Security ogohlantirish: parolingiz yangilandi",
      payload: {
        via: "settings_security_page",
      },
      dedupeKey: `password:${user.id}:changed:email`,
      force: true,
    },
    { supabase }
  );

  return NextResponse.json({ ok: true });
}
