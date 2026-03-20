import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabasePublicConfig } from '@/utils/supabase/config'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const loginRedirectPath = `${pathname}${request.nextUrl.search}`

  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', loginRedirectPath)
    return NextResponse.redirect(loginUrl)
  }

  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
