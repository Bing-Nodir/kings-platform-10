"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CircleHelp,
  FileText,
  LayoutGrid,
  GraduationCap,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  UploadCloud,
  Users,
  WalletCards,
} from "lucide-react";
import { logout } from "@/app/auth/actions";

const navItems = [
  { href: "/instructor", label: "Dashboard", icon: LayoutGrid, exact: true },
  {
    href: "/instructor/submissions",
    label: "My Courses",
    icon: FileText,
    exact: false,
  },
  { href: "/instructor/students", label: "Students", icon: Users, exact: false },
  { href: "/instructor/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { href: "/instructor/assets", label: "Media Uploads", icon: UploadCloud, exact: false },
  { href: "/instructor/questions", label: "Student Q&A", icon: MessageSquare, exact: false },
  { href: "/instructor/financial", label: "Financials", icon: WalletCards, exact: false },
  { href: "/settings", label: "Settings", icon: Settings, exact: false },
];

export default function InstructorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-emerald-950/10 bg-emerald-950 px-8 text-white">
        <Link href="/instructor" className="text-xl font-black tracking-tight">
          Kings Instructor Pro
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          <Link href="/courses" className="text-emerald-100/70 hover:text-white">
            Explore
          </Link>
          <Link href="/instructor" className="border-b-2 border-white pb-1 text-white">
            Instructor Mode
          </Link>
          <Link href="/dashboard" className="text-emerald-100/70 hover:text-white">
            Student Mode
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <label className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-100/60" />
            <input
              type="search"
              placeholder="Search curriculum..."
              className="h-10 w-72 rounded-lg border border-white/10 bg-white/10 pl-10 pr-4 text-sm text-white outline-none placeholder:text-emerald-100/60 focus:border-white/40"
            />
          </label>
          <Link href="/instructor/financial" aria-label="Analytics">
            <BarChart3 className="h-5 w-5" />
          </Link>
          <Link href="/settings" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-40 flex w-72 flex-col border-r border-slate-200 bg-gradient-to-b from-emerald-50 to-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-8 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-950 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-black text-emerald-950">
              The Academy
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Elite Instructor Suite
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8">
          <div className="space-y-2 px-4">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-12 items-center gap-4 rounded-xl px-5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-emerald-100 text-emerald-950 shadow-sm"
                      : "text-emerald-900/70 hover:bg-white hover:text-emerald-950"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="space-y-2 border-t border-slate-200 p-4">
          <Link
            href="/settings/support"
            className="flex h-11 items-center gap-4 rounded-xl px-5 text-sm font-semibold text-emerald-900/70 hover:bg-white hover:text-emerald-950"
          >
            <CircleHelp className="h-5 w-5" />
            Support
          </Link>
          <Link
            href="/dashboard"
            className="flex h-11 items-center gap-4 rounded-xl px-5 text-sm font-semibold text-emerald-900/70 hover:bg-white hover:text-emerald-950"
          >
            <BookOpen className="h-5 w-5" />
            Learner Mode
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex h-11 w-full items-center gap-4 rounded-xl px-5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="ml-72 pt-16">{children}</main>
    </div>
  );
}
