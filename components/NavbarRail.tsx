"use client"

import {
  BookOpen,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  MapPinned,
  ShoppingBag,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"

type NavbarIconKey =
  | "home"
  | "courses"
  | "shop"
  | "about"
  | "offices"
  | "dashboard"
  | "terms"
  | "business"

type NavbarRailItem = {
  name: string
  url: string
  icon: NavbarIconKey
}

const iconMap: Record<NavbarIconKey, LucideIcon> = {
  home: Home,
  courses: BookOpen,
  shop: ShoppingBag,
  about: UserRound,
  offices: MapPinned,
  dashboard: LayoutDashboard,
  terms: FileText,
  business: Building2,
}

export default function NavbarRail({
  items,
  className,
}: {
  items: NavbarRailItem[]
  className?: string
}) {
  return (
    <NavBar
      items={items.map((item) => ({
        ...item,
        icon: iconMap[item.icon],
      }))}
      className={className}
    />
  )
}
