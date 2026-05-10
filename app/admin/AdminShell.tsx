"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CircleHelp,
  Database,
  GraduationCap,
  HeartPulse,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { logout } from "@/app/auth/actions";

const primaryNavItems = [
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/orders", label: "Financials", icon: ShoppingBag, exact: false },
  { href: "/admin/reviews", label: "Instructors", icon: GraduationCap, exact: false },
  { href: "/admin/courses", label: "Content", icon: BookOpen, exact: false },
  { href: "/admin/messages", label: "Support", icon: MessageSquare, exact: false },
];

const secondaryNavItems = [
  { href: "/admin", label: "System Overview", icon: Activity, exact: true },
  { href: "/admin/analytics", label: "Learning Analytics", icon: BarChart3, exact: false },
  { href: "/admin/content", label: "Content Store", icon: Database, exact: false },
  { href: "/admin/operations", label: "Operations", icon: Bell, exact: false },
];

function isActive(pathname: string, item: { href: string; exact: boolean }) {
  return item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href) && item.href !== "/admin";
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-11 items-center gap-3 border-r px-5 text-sm font-medium transition-colors ${
        active
          ? "border-emerald-950 bg-emerald-50 text-emerald-950"
          : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminShell({
  children,
  adminUser,
}: {
  children: React.ReactNode;
  adminUser: {
    name: string;
    email: string;
  };
}) {
  const pathname = usePathname();
  const initials = adminUser.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[214px] flex-col border-r border-slate-200 bg-[#f8fbff]">
        <Link href="/admin" className="flex h-[68px] items-center gap-3 px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950 text-white shadow-sm shadow-emerald-950/20">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold leading-5">Control Center</span>
            <span className="text-xs text-slate-500">System Overview</span>
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto py-8">
          <div className="space-y-1">
            {primaryNavItems.map((item) => (
              <AdminNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(pathname, item)}
              />
            ))}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4">
            {secondaryNavItems.map((item) => (
              <AdminNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(pathname, item)}
              />
            ))}
          </div>
        </nav>

        <div className="space-y-1 border-t border-slate-200 py-4">
          <Link
            href="/admin/settings"
            className="flex h-10 items-center gap-3 px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            <HeartPulse className="h-4 w-4 text-emerald-700" />
            System Health
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex h-10 w-full items-center gap-3 px-6 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="pl-[214px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-[#fbfcff]/95 px-8 backdrop-blur">
          <label className="relative block w-full max-w-[620px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Global system lookup..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100/80 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-800 focus:bg-white"
            />
          </label>

          <div className="flex items-center gap-5">
            <Link
              href="/admin/operations"
              aria-label="Operations"
              className="relative text-slate-600 transition-colors hover:text-slate-950"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-600" />
            </Link>
            <Link
              href="/admin/settings"
              aria-label="Settings"
              className="text-slate-600 transition-colors hover:text-slate-950"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/settings"
              aria-label="Help"
              className="text-slate-600 transition-colors hover:text-slate-950"
            >
              <CircleHelp className="h-5 w-5" />
            </Link>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-emerald-900 bg-emerald-50 text-sm font-black text-emerald-950">
                {initials}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-bold leading-4">
                  {adminUser.name}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Chief Admin
                </span>
              </span>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-68px)] px-8 py-9">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 hidden gap-2 xl:flex">
        <Link
          href="/api/health/ready"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-800 hover:text-emerald-900"
        >
          <ShieldCheck className="h-4 w-4" />
          Health JSON
        </Link>
        <Link
          href="/admin/settings"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-800 hover:text-emerald-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Controls
        </Link>
      </div>
    </div>
  );
}
