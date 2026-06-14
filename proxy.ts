import { NextResponse, type NextRequest } from "next/server";
import { isPrimaryAdminEmail } from "@/lib/admin-access";
import { createClient } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const middlewareClient = createClient(request);
  const {
    data: { user },
  } = await middlewareClient.supabase.auth.getUser();
  const needsAuthCheck =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  if (!needsAuthCheck) {
    return middlewareClient.response;
  }

  const loginRedirectPath = `${pathname}${request.nextUrl.search}`;
  const isConfiguredAdmin = isPrimaryAdminEmail(user?.email);
  let isAdmin = isConfiguredAdmin;

  if (user && !isAdmin) {
    const { data: profile } = await middlewareClient.supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.role === "admin";
  }

  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", loginRedirectPath);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url)
    );
  }

  if (user && isAdmin && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (user && pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return middlewareClient.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
