"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  Palette,
  Shield,
  User,
} from "lucide-react";

interface SettingsSidebarProps {
  displayName: string;
  email: string;
  role: string;
}

export default function SettingsSidebar({
  displayName,
  email,
  role,
}: SettingsSidebarProps) {
  const pathname = usePathname();
  const items = [
    {
      href: "/settings",
      label: "Boshqaruv markazi",
      icon: LayoutDashboard,
      exact: true,
    },
    { href: "/settings/profile", label: "Profil", icon: User },
    { href: "/settings/appearance", label: "Ko'rinish", icon: Palette },
    { href: "/settings/notifications", label: "Xabarnomalar", icon: Bell },
    { href: "/settings/security", label: "Xavfsizlik", icon: Shield },
    { href: "/settings/billing", label: "To'lovlar", icon: CreditCard },
    ...(role === "instructor" || role === "admin"
      ? [
          {
            href: "/instructor",
            label: "Instructor Studio",
            icon: BriefcaseBusiness,
            exact: false,
          },
        ]
      : []),
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="overflow-hidden rounded-[2rem] border border-blue-200/70 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%),linear-gradient(135deg,#1d4ed8_0%,#1e3a8a_52%,#0f172a_100%)] p-6 text-white shadow-[0_24px_80px_-32px_rgba(30,64,175,0.65)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/80">
          Sozlamalar markazi
        </p>
        <h2 className="mt-4 text-2xl font-black tracking-tight">{displayName}</h2>
        <p className="mt-2 text-sm text-blue-100/85">{email}</p>
        <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
          {role}
        </div>
        <p className="mt-5 text-sm leading-7 text-blue-50/85">
          Profil, ko&apos;rinish, xavfsizlik va billing sozlamalari bir markazda boshqariladi.
        </p>
      </div>

      <nav className="overflow-x-auto rounded-[1.75rem] border border-gray-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="flex gap-2 lg:flex-col">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
