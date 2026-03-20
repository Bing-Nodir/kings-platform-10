"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users, exact: false },
  { href: "/admin/courses", label: "Kurslar", icon: BookOpen, exact: false },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ShoppingBag, exact: false },
  { href: "/admin/messages", label: "Murojaatlar", icon: MessageSquare, exact: false },
  { href: "/admin/content", label: "Sayt matnlari", icon: FileText, exact: false },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings, exact: false },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <aside className="fixed bottom-0 left-0 top-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Kings Admin
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Boshqaruv paneli
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== "/admin";
              const isDashboard = item.exact && pathname === "/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active || isDashboard
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {(active || isDashboard) && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-300"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Saytga qaytish
          </Link>
        </div>
      </aside>

      <main className="ml-64 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
