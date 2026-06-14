"use server";

import { revalidatePath } from "next/cache";
import { isPrimaryAdminEmail } from "@/lib/admin-access";
import { requireAdminContext } from "@/lib/server/auth";
import {
  safeQueueUserEmailNotification,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";

const VALID_ROLES = new Set(["student", "instructor", "admin"]);

export async function updateUserRole(userId: string, role: string) {
  if (!userId || !VALID_ROLES.has(role)) {
    return { error: "Noto'g'ri role" };
  }

  try {
    const { supabase, user } = await requireAdminContext();

    if (user.id === userId && role !== "admin") {
      return { error: "Admin o'zini admin roldan tushira olmaydi" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return { error: profileError?.message ?? "Foydalanuvchi topilmadi" };
    }

    if (role === "instructor" && profile.role !== "instructor") {
      const { data: approvedApplication, error: applicationError } =
        await supabase
          .from("instructor_applications")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "approved")
          .maybeSingle();

      if (applicationError) {
        return { error: applicationError.message };
      }

      if (!approvedApplication) {
        return {
          error:
            "Instructor roli faqat /admin/reviews sahifasida ariza approve qilingandan keyin beriladi.",
        };
      }
    }

    if (isPrimaryAdminEmail(profile.email) && role !== "admin") {
      return {
        error: "Asosiy admin emaili admin roldan tushirilmaydi",
      };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    await safeRecordOperationalEvent(
      {
        userId,
        scope: "security",
        eventType: "user_role_updated",
        entityType: "profile",
        entityId: userId,
        title: "Admin foydalanuvchi rolini yangiladi",
        detail: {
          previousRole: profile.role,
          nextRole: role,
          changedBy: user.id,
        },
        dedupeKey: `profile:${userId}:role:${role}`,
      },
      { supabase }
    );

    await safeQueueUserEmailNotification(
      {
        userId,
        email: profile.email,
        eventType: "user_role_updated",
        subject: "Hisobingiz roli yangilandi",
        payload: {
          fullName: profile.full_name,
          previousRole: profile.role,
          nextRole: role,
        },
        dedupeKey: `profile:${userId}:role:${role}:email`,
        force: true,
      },
      { supabase }
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/instructor");
    revalidatePath("/settings");

    return { ok: true };
  } catch {
    return { error: "Ruxsat yo'q" };
  }
}
