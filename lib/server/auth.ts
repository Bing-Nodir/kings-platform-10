import type { User } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

async function fetchRole(supabase: SupabaseServerClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  return profile?.role ?? "student"
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
  userId: string
) {
  return (await fetchRole(supabase, userId)) === "admin"
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

  if (!(await isAdminUser(supabase, user.id))) {
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

  if (!(await isAdminUser(supabase, user.id))) {
    throw new Error("Forbidden")
  }

  return { supabase, user }
}
