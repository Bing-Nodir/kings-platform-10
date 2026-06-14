import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { isPrimaryAdminEmail, normalizeEmail } from "@/lib/admin-access"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
export type AppRole = "student" | "instructor" | "admin"

async function fetchRole(supabase: SupabaseServerClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  return (profile?.role ?? "student") as AppRole
}

async function ensurePrimaryAdminRole(
  supabase: SupabaseServerClient,
  userId: string,
  email?: string | null
) {
  if (!isPrimaryAdminEmail(email)) {
    return false
  }

  const normalizedEmail = normalizeEmail(email)

  const upsertProfile = async (client: Pick<SupabaseServerClient, "from">) => {
    const { error } = await client
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: normalizedEmail,
          role: "admin",
        },
        { onConflict: "id" }
      )

    return !error
  }

  if (await upsertProfile(supabase)) {
    return true
  }

  try {
    const adminSupabase = createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", userId)
      .maybeSingle()

    if (profileError) {
      return false
    }

    if (profile?.role === "admin" && normalizeEmail(profile.email) === normalizedEmail) {
      return true
    }

    return upsertProfile(adminSupabase)
  } catch {
    return false
  }
}

export async function getAuthenticatedContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}

export async function getUserRole(
  supabase: SupabaseServerClient,
  userId: string
) {
  return fetchRole(supabase, userId)
}

export async function isAdminUser(
  supabase: SupabaseServerClient,
  userId: string,
  email?: string | null
) {
  if (isPrimaryAdminEmail(email)) {
    await ensurePrimaryAdminRole(supabase, userId, email)
    return true
  }

  return (await fetchRole(supabase, userId)) === "admin"
}

export async function isInstructorUser(
  supabase: SupabaseServerClient,
  userId: string,
  email?: string | null
) {
  const role = await fetchRole(supabase, userId)
  return role === "instructor" || (await isAdminUser(supabase, userId, email))
}

export async function hasCourseEnrollment(
  supabase: SupabaseServerClient,
  userId: string,
  courseId: string
) {
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle()

  return Boolean(enrollment)
}

export async function requireAuthenticatedPage(loginRedirect = "/login") {
  const { supabase, user } = await getAuthenticatedContext()

  if (!user) {
    redirect(loginRedirect)
  }

  return { supabase, user }
}

export async function requireAdminPage(options?: {
  loginRedirect?: string
  fallbackRedirect?: string
}) {
  const loginRedirect = options?.loginRedirect ?? "/login?redirect=/admin"
  const fallbackRedirect = options?.fallbackRedirect ?? "/dashboard"
  const { supabase, user } = await requireAuthenticatedPage(loginRedirect)

  if (!(await isAdminUser(supabase, user.id, user.email))) {
    redirect(fallbackRedirect)
  }

  return { supabase, user }
}

export async function requireAdminContext(): Promise<{
  supabase: SupabaseServerClient
  user: User
}> {
  const { supabase, user } = await getAuthenticatedContext()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!(await isAdminUser(supabase, user.id, user.email))) {
    throw new Error("Forbidden")
  }

  return { supabase, user }
}

export async function requireInstructorPage(options?: {
  loginRedirect?: string
  fallbackRedirect?: string
}) {
  const loginRedirect = options?.loginRedirect ?? "/login?redirect=/instructor"
  const fallbackRedirect = options?.fallbackRedirect ?? "/dashboard"
  const { supabase, user } = await requireAuthenticatedPage(loginRedirect)

  if (!(await isInstructorUser(supabase, user.id, user.email))) {
    redirect(fallbackRedirect)
  }

  return { supabase, user }
}

export async function requireInstructorContext(): Promise<{
  supabase: SupabaseServerClient
  user: User
}> {
  const { supabase, user } = await getAuthenticatedContext()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!(await isInstructorUser(supabase, user.id, user.email))) {
    throw new Error("Forbidden")
  }

  return { supabase, user }
}
