"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isValidEmail,
  normalizeSingleLine,
  sanitizeRedirectPath,
} from "@/lib/server/validation";
import { createClient } from "@/utils/supabase/server";

function redirectWithError(
  pathname: "/login" | "/register",
  error: string,
  redirectTo?: string
) {
  const params = new URLSearchParams({ error });

  if (redirectTo && redirectTo !== "/dashboard") {
    params.set("redirect", redirectTo);
  }

  redirect(`${pathname}?${params.toString()}`);
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = normalizeSingleLine(formData.get("email"), 160).toLowerCase();
  const password =
    typeof formData.get("password") === "string"
      ? formData.get("password")!.toString()
      : "";
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirect"),
    "/dashboard"
  );

  if (!isValidEmail(email) || password.length < 6) {
    redirectWithError(
      "/login",
      "Email yoki parol formati noto'g'ri.",
      redirectTo
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithError("/login", error.message, redirectTo);
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const fullName = normalizeSingleLine(formData.get("full_name"), 100);
  const email = normalizeSingleLine(formData.get("email"), 160).toLowerCase();
  const password =
    typeof formData.get("password") === "string"
      ? formData.get("password")!.toString()
      : "";

  if (fullName.length < 3) {
    redirectWithError(
      "/register",
      "To'liq ism kamida 3 ta belgidan iborat bo'lsin."
    );
  }

  if (!isValidEmail(email)) {
    redirectWithError("/register", "Email formati noto'g'ri.");
  }

  if (password.length < 6) {
    redirectWithError(
      "/register",
      "Parol kamida 6 ta belgidan iborat bo'lsin."
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirectWithError("/register", error.message);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
