import Link from "next/link"
import {
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react"
import { logout } from "@/app/auth/actions"
import NavbarRail from "@/components/NavbarRail"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { getSiteContent } from "@/lib/site-content"
import { createClient } from "@/utils/supabase/server"

export default async function Navbar() {
  const supabase = await createClient()
  const siteContent = await getSiteContent()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const navItems = [
    { name: "Bosh sahifa", url: "/", icon: "home" as const },
    { name: "Kurslar", url: "/courses", icon: "courses" as const },
    { name: "Do'kon", url: "/shop", icon: "shop" as const },
    { name: "Biznes", url: "/business", icon: "business" as const },
    { name: "Haqimizda", url: "/about", icon: "about" as const },
    { name: "Ofislar", url: "/offices", icon: "offices" as const },
    ...(user ? [{ name: "Dashboard", url: "/dashboard", icon: "dashboard" as const }] : []),
  ]

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden sm:block">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 pt-5 md:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="pointer-events-auto inline-flex shrink-0 items-center"
            aria-label="Kings Education bosh sahifasi"
          >
            <span className="text-2xl font-extrabold tracking-tighter text-black drop-shadow-sm dark:text-white">
              Kings<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <NavbarRail
            items={navItems}
            className="pointer-events-auto hidden lg:block lg:static lg:left-auto lg:top-auto lg:bottom-auto lg:mb-0 lg:translate-x-0 lg:transform-none lg:pt-0"
          />

          {/* Utility Buttons */}
          <div className="pointer-events-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <form action="/search" className="relative hidden xl:flex">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                aria-label="Sayt bo'ylab qidiruv"
                placeholder={siteContent.navbarSearchPlaceholder}
                className="h-10 w-64 rounded-full border border-border bg-background/80 pl-10 pr-12 text-sm outline-none transition-colors focus:border-primary backdrop-blur-lg"
              />
              <button
                type="submit"
                aria-label="Qidirish"
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            <Link
              href="/search"
              aria-label="Qidirish"
              className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/shop"
              aria-label="Marketplace"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  aria-label="Dashboard"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
                <Link
                  href="/profile"
                  aria-label="Profil"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
                >
                  <User className="h-4 w-4" />
                </Link>
                <Link
                  href="/settings"
                  aria-label="Sozlamalar"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-4 py-2 text-sm font-medium text-red-600 shadow-lg backdrop-blur-lg transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                  >
                    <LogOut className="h-4 w-4" /> <span className="hidden xl:inline">Chiqish</span>
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
              >
                <User className="h-4 w-4" /> Kirish
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="fixed left-4 top-4 z-50 sm:hidden">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Kings Education bosh sahifasi"
        >
          <span className="text-2xl font-extrabold tracking-tighter text-black drop-shadow-sm dark:text-white">
            Kings<span className="text-blue-600">.</span>
          </span>
        </Link>
      </div>

      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 sm:hidden">
        <LanguageSwitcher compact />

        <Link
          href="/shop"
          aria-label="Marketplace"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        >
          <ShoppingCart className="h-4 w-4" />
        </Link>
        {user ? (
          <>
            <Link
              href="/profile"
              aria-label="Profil"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <User className="h-4 w-4" />
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50/90 text-red-600 shadow-lg backdrop-blur-lg transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                aria-label="Chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            aria-label="Kirish"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            <User className="h-4 w-4" />
          </Link>
        )}
      </div>

      <NavbarRail items={navItems} className="sm:hidden" />

      <div className="h-20 sm:h-24" />
    </>
  )
}
