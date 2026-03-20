"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isValidEmail,
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";
import { createClient } from "@/utils/supabase/server";

export async function submitContactForm(formData: FormData) {
  const name = normalizeSingleLine(formData.get("name"), 80);
  const email = normalizeSingleLine(formData.get("email"), 160).toLowerCase();
  const subject = normalizeSingleLine(formData.get("subject"), 120);
  const message = normalizeMultiline(formData.get("message"), 3000);

  if (!name || !email || !subject || !message) {
    redirect("/contact?error=missing");
  }

  if (!isValidEmail(email)) {
    redirect("/contact?error=invalid_email");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_messages").insert({
    user_id: user?.id ?? null,
    name,
    email,
    subject,
    message,
  });

  if (error) {
    redirect("/contact?error=save_failed");
  }

  revalidatePath("/admin/messages");
  redirect("/contact?sent=1");
}
