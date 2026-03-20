"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Renders its children (the Navbar) only on non-admin, non-watch routes.
 * Admin pages have their own sidebar; watch pages have their own header.
 */
export default function NavbarConditional({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const hideNavbar =
    pathname.startsWith("/admin") ||
    (pathname.includes("/watch") && pathname.includes("/courses"))

  if (hideNavbar) return null

  return <>{children}</>
}
