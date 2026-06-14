"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PRIMARY_ADMIN_EMAIL, isPrimaryAdminEmail } from "@/lib/admin-access";
import { isAdminUser } from "@/lib/server/auth";
import {
  safeQueueNotificationJob,
  safeRecordOperationalEvent,
} from "@/lib/server/operations";
import {
  isValidEmail,
  normalizeSingleLine,
  sanitizeRedirectPath,
} from "@/lib/server/validation";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "Supabase Auth bilan vaqtinchalik ulanish uzildi. Internet/VPN holatini tekshirib, bir necha soniyadan keyin qayta urinib ko'ring.";
const AUTH_RETRY_ATTEMPTS = 4;
const AUTH_RETRY_DELAY_MS = 550;

async function resolvePostLoginRedirect(
  userId: string,
  userEmail: string | null | undefined,
  requestedPath: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  if (isPrimaryAdminEmail(userEmail)) {
    await isAdminUser(supabase, userId, userEmail);
    return requestedPath.startsWith("/admin") ? requestedPath : "/admin";
  }

  if (requestedPath.startsWith("/admin")) {
    return (await isAdminUser(supabase, userId, userEmail)) ? requestedPath : "/dashboard";
  }

  if (requestedPath !== "/dashboard") {
    return requestedPath;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") {
    return "/admin";
  }

  if (profile?.role === "instructor") {
    return "/instructor";
  }

  return "/dashboard";
}

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

function redirectWithMessage(
  pathname: "/login" | "/register",
  message: string,
  redirectTo?: string
) {
  const params = new URLSearchParams({ message });

  if (redirectTo && redirectTo !== "/dashboard") {
    params.set("redirect", redirectTo);
  }

  redirect(`${pathname}?${params.toString()}`);
}

function getErrorCauseCode(error: unknown) {
  if (!error || typeof error !== "object" || !("cause" in error)) {
    return "";
  }

  const cause = (error as { cause?: { code?: unknown } }).cause;
  return typeof cause?.code === "string" ? cause.code : "";
}

function getAuthErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";
  const causeCode = getErrorCauseCode(error);
  const normalized = `${message} ${causeCode}`.toLowerCase();

  if (
    normalized.includes("fetch failed") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("enotfound") ||
    normalized.includes("eai_again") ||
    normalized.includes("etimedout")
  ) {
    return AUTH_SERVICE_UNAVAILABLE_MESSAGE;
  }

  if (normalized.includes("email not confirmed")) {
    return "Email hali tasdiqlanmagan. Endi student signup avtomatik tasdiqlanadi, mavjud hisob bo'lsa qayta ro'yxatdan o'ting yoki login qiling.";
  }

  if (normalized.includes("invalid login credentials")) {
    return `Email yoki parol noto'g'ri. Asosiy admin email: ${PRIMARY_ADMIN_EMAIL}.`;
  }

  return message || "Auth xatosi yuz berdi. Qaytadan urinib ko'ring.";
}

async function findAuthUserByEmail(email: string) {
  const adminSupabase = createAdminClient();
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (found) {
      return found;
    }

    if (data.users.length < 1000) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function ensureAuthUserIsEmailConfirmed(email: string) {
  const user = await findAuthUserByEmail(email);

  if (!user || user.email_confirmed_at) {
    return user;
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.auth.admin.updateUserById(
    user.id,
    {
      email_confirm: true,
    }
  );

  if (error) {
    throw error;
  }

  return data.user ?? user;
}

async function createConfirmedStudentAccount(options: {
  email: string;
  password: string;
  fullName: string;
}) {
  const adminSupabase = createAdminClient();
  const role = isPrimaryAdminEmail(options.email) ? "admin" : "student";

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: options.email,
    password: options.password,
    email_confirm: true,
    user_metadata: {
      full_name: options.fullName,
    },
    app_metadata: {
      app_role: role,
    },
  });

  if (!error && data.user) {
    await adminSupabase.from("profiles").upsert(
      {
        id: data.user.id,
        full_name: options.fullName,
        email: options.email,
        role,
      },
      { onConflict: "id" }
    );

    return { userId: data.user.id, created: true };
  }

  const message = error?.message.toLowerCase() ?? "";

  if (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  ) {
    const user = await ensureAuthUserIsEmailConfirmed(options.email);

    if (user) {
      await adminSupabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: options.fullName,
          email: options.email,
          role: isPrimaryAdminEmail(options.email) ? "admin" : "student",
        },
        { onConflict: "id" }
      );
    }

    return { userId: user?.id ?? null, created: false };
  }

  throw error ?? new Error("Auth user yaratilmadi");
}

async function recordAuthEvent(input: {
  userId?: string | null;
  email: string;
  fullName?: string;
  eventType: string;
  title: string;
  severity?: "info" | "warning" | "error";
  detail?: Record<string, unknown>;
}) {
  const adminEvent = isPrimaryAdminEmail(input.email);

  await safeRecordOperationalEvent(
    {
      userId: input.userId ?? null,
      scope: "security",
      eventType: input.eventType,
      severity: input.severity ?? "info",
      entityType: "auth_user",
      entityId: input.userId ?? input.email,
      title: input.title,
      detail: {
        email: input.email,
        fullName: input.fullName ?? null,
        adminEmail: adminEvent,
        ...input.detail,
      },
      dedupeKey: `${input.eventType}:${input.userId ?? input.email}:${Date.now()}`,
    },
    { preferAdmin: true }
  );

  if (!adminEvent) {
    await safeQueueNotificationJob(
      {
        userId: input.userId ?? null,
        channel: "in_app",
        eventType: input.eventType,
        recipient: "admin",
        subject: input.title,
        templateKey: input.eventType,
        payload: {
          email: input.email,
          fullName: input.fullName ?? null,
          ...input.detail,
        },
        dedupeKey: `admin-notice:${input.eventType}:${input.userId ?? input.email}:${Date.now()}`,
      },
      { preferAdmin: true }
    );
  }
}

function isTransientAuthError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";
  const normalized = `${message} ${getErrorCauseCode(error)}`.toLowerCase();

  return (
    normalized.includes("fetch failed") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("econnreset") ||
    normalized.includes("enotfound") ||
    normalized.includes("eai_again") ||
    normalized.includes("etimedout")
  );
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAuthRequest<T>(task: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 0; attempt < AUTH_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const result = await task();
      const maybeError =
        result && typeof result === "object" && "error" in result
          ? (result as { error?: unknown }).error
          : null;

      if (
        maybeError &&
        isTransientAuthError(maybeError) &&
        attempt < AUTH_RETRY_ATTEMPTS - 1
      ) {
        await wait(AUTH_RETRY_DELAY_MS);
        continue;
      }

      return result;
    } catch (error) {
      lastError = error;

      if (
        !isTransientAuthError(error) ||
        attempt === AUTH_RETRY_ATTEMPTS - 1
      ) {
        throw error;
      }

      await wait(AUTH_RETRY_DELAY_MS);
    }
  }

  throw lastError;
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

  let result: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

  try {
    result = await runAuthRequest(() =>
      supabase.auth.signInWithPassword({
        email,
        password,
      })
    );
  } catch (error) {
    redirectWithError("/login", getAuthErrorMessage(error), redirectTo);
  }

  if (
    result!.error &&
    getAuthErrorMessage(result!.error).toLowerCase().includes("tasdiqlanmagan")
  ) {
    try {
      const confirmedUser = await ensureAuthUserIsEmailConfirmed(email);

      if (confirmedUser) {
        await recordAuthEvent({
          userId: confirmedUser.id,
          email,
          eventType: "email_auto_confirmed_for_student_login",
          title: "Student email confirmation server orqali ochildi",
          detail: {
            reason: "login_email_not_confirmed",
          },
        });
      }

      result = await runAuthRequest(() =>
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      );
    } catch (confirmError) {
      redirectWithError("/login", getAuthErrorMessage(confirmError), redirectTo);
    }
  }

  const { data, error } = result!;

  if (error) {
    await recordAuthEvent({
      email,
      eventType: "login_failed",
      title: "Login urinishi muvaffaqiyatsiz tugadi",
      severity: "warning",
      detail: {
        reason: error.message,
      },
    });
    redirectWithError("/login", getAuthErrorMessage(error), redirectTo);
  }

  const signedInUser = data.user;

  if (!signedInUser) {
    redirectWithError("/login", "Foydalanuvchi sessiyasi yaratilmadi.", redirectTo);
  }

  await recordAuthEvent({
    userId: signedInUser!.id,
    email,
    eventType: "login_succeeded",
    title: isPrimaryAdminEmail(email)
      ? "Primary admin tizimga kirdi"
      : "Foydalanuvchi tizimga kirdi",
    detail: {
      redirectTo,
    },
  });

  revalidatePath("/", "layout");
  redirect(
    await resolvePostLoginRedirect(
      signedInUser!.id,
      signedInUser!.email,
      redirectTo,
      supabase
    )
  );
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const fullName = normalizeSingleLine(formData.get("full_name"), 100);
  const email = normalizeSingleLine(formData.get("email"), 160).toLowerCase();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirect"),
    "/dashboard"
  );
  const password =
    typeof formData.get("password") === "string"
      ? formData.get("password")!.toString()
      : "";

  if (fullName.length < 3) {
    redirectWithError(
      "/register",
      "To'liq ism kamida 3 ta belgidan iborat bo'lsin.",
      redirectTo
    );
  }

  if (!isValidEmail(email)) {
    redirectWithError("/register", "Email formati noto'g'ri.", redirectTo);
  }

  if (password.length < 6) {
    redirectWithError(
      "/register",
      "Parol kamida 6 ta belgidan iborat bo'lsin.",
      redirectTo
    );
  }

  let createdUserId: string | null = null;

  try {
    const created = await createConfirmedStudentAccount({
      email,
      password,
      fullName,
    });
    createdUserId = created.userId;

    await recordAuthEvent({
      userId: created.userId,
      email,
      fullName,
      eventType: created.created ? "student_registered" : "student_signup_existing_account",
      title: created.created
        ? "Yangi student ro'yxatdan o'tdi"
        : "Student mavjud hisob bilan ro'yxatdan o'tishga urindi",
      detail: {
        emailConfirmedByServer: true,
      },
    });
  } catch (error) {
    redirectWithError("/register", getAuthErrorMessage(error), redirectTo);
  }

  let result: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

  try {
    result = await runAuthRequest(() =>
      supabase.auth.signInWithPassword({
        email,
        password,
      })
    );
  } catch (error) {
    redirectWithError("/register", getAuthErrorMessage(error), redirectTo);
  }

  const initialError = result!.error;

  if (initialError) {
    if (getAuthErrorMessage(initialError).toLowerCase().includes("tasdiqlanmagan")) {
      try {
        await ensureAuthUserIsEmailConfirmed(email);
        result = await runAuthRequest(() =>
          supabase.auth.signInWithPassword({
            email,
            password,
          })
        );
      } catch (confirmError) {
        redirectWithError("/register", getAuthErrorMessage(confirmError), redirectTo);
      }
    }
  }

  const retryError = result!.error;

  if (retryError) {
    await recordAuthEvent({
      userId: createdUserId,
      email,
      fullName,
      eventType: "student_signup_login_failed",
      title: "Student ro'yxatdan o'tdi, lekin sessiya ochilmadi",
      severity: "warning",
      detail: {
        reason: retryError.message,
      },
    });
    redirectWithError("/register", getAuthErrorMessage(retryError), redirectTo);
  }

  revalidatePath("/", "layout");

  const signedUpUser = result!.data.user;

  if (!result!.data.session || !signedUpUser) {
    redirectWithMessage(
      "/login",
      "Hisob yaratildi. Iltimos, email va parolingiz bilan tizimga kiring.",
      redirectTo
    );
  }

  const userForRedirect = signedUpUser as NonNullable<typeof signedUpUser>;

  redirect(
    await resolvePostLoginRedirect(
      userForRedirect.id,
      userForRedirect.email,
      redirectTo,
      supabase
    )
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
