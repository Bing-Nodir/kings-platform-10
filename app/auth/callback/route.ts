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
      const destination = isPrimaryAdminEmail(user?.email)
        ? next.startsWith("/admin")
          ? next
          : "/admin"
        : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-error`);
}
