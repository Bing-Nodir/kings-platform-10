import { createClient } from "@/utils/supabase/server";
import { isPrimaryAdminEmail } from "@/lib/admin-access";
import { sanitizeRedirectPath } from "@/lib/server/validation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let isAdmin = isPrimaryAdminEmail(user?.email);

      if (user && !isAdmin) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        isAdmin = profile?.role === "admin";
      }

      const destination = isAdmin
        ? next.startsWith("/admin")
          ? next
          : "/admin"
        : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-error`);
}
