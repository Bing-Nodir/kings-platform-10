"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { normalizeSingleLine } from "@/lib/server/validation";

export async function updateProfile(
  _prevState: { ok?: boolean; error?: string } | null,
  formData: FormData
) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) return { error: "Tizimga kiring" };

  const fullName = normalizeSingleLine(formData.get("full_name"), 100);
  if (fullName.length < 3) {
    return { error: "Ism kamida 3 ta belgidan iborat bo'lsin" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
