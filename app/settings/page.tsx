import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CreditCard,
  Globe2,
  Palette,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { requireAuthenticatedPage } from "@/lib/server/auth";
import { getSecurityAuditLogs, getUserPreferences } from "@/lib/server/settings";

function formatThemeLabel(theme: string) {
  if (theme === "midnight") return "Midnight";
  if (theme === "dark") return "Qorong'i";
  if (theme === "light") return "Yorug'";
  return "Tizim";
}

function formatActivityLabel(action: string) {
  if (action === "profile_updated") return "Profil yangilandi";
  if (action === "preferences_updated") return "Ko'rinish yoki xabarnoma sozlandi";
  if (action === "password_changed") return "Parol almashtirildi";
  return action.replaceAll("_", " ");
}

export default async function SettingsPage() {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings"
  );

  const [
    { data: profile },
    preferences,
    recentActivity,
    { count: enrollmentsCount },
    { count: orderCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, role, company_name, language_pref")
      .eq("id", user.id)
      .maybeSingle(),
    getUserPreferences(user.id, supabase),
    getSecurityAuditLogs(user.id, { limit: 4 }, supabase),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Foydalanuvchi";
  const setupCards = [
    {
      href: "/settings/profile",
      title: "Profilni boshqarish",
      description:
        "Ism, telefon, kompaniya va bio ma'lumotlaringizni professional profilga aylantiring.",
      icon: User,
      accent:
        "from-blue-500/15 via-blue-500/5 to-transparent dark:from-blue-500/20",
      cta: "Profilni tahrirlash",
    },
    {
      href: "/settings/appearance",
      title: "Ko'rinish va til",
      description:
        "Theme va til tanlovlari endi backendga sync qilinadi va barcha sessionlarda saqlanadi.",
      icon: Palette,
      accent:
        "from-violet-500/15 via-violet-500/5 to-transparent dark:from-violet-500/20",
      cta: "Ko'rinishni sozlash",
    },
    {
      href: "/settings/notifications",
      title: "Xabarnoma oqimlari",
      description:
        "Email, push va marketing ogohlantirishlarini ehtiyojingizga mos ravishda yoqing yoki o'chiring.",
      icon: Bell,
      accent:
        "from-emerald-500/15 via-emerald-500/5 to-transparent dark:from-emerald-500/20",
      cta: "Xabarnomalarni boshqarish",
    },
    {
      href: "/settings/security",
      title: "Xavfsizlik markazi",
      description:
        "Parolni yangilang va account bo'yicha audit loglar orqali muhim o'zgarishlarni kuzating.",
      icon: Shield,
      accent:
        "from-rose-500/15 via-rose-500/5 to-transparent dark:from-rose-500/20",
      cta: "Xavfsizlikni kuchaytirish",
    },
    {
      href: "/settings/security#account-export",
      title: "Account export",
      description:
        "Profil, preferences, audit log va billing tarixini JSON arxiv sifatida yuklab oling.",
      icon: Globe2,
      accent:
        "from-sky-500/15 via-sky-500/5 to-transparent dark:from-sky-500/20",
      cta: "Arxivni tayyorlash",
    },
    {
      href: "/settings/billing",
      title: "Billing va access",
      description:
        "Buyurtmalar tarixi, receipt yuklash va support ticketlar bir joyda boshqariladi.",
      icon: CreditCard,
      accent:
        "from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/20",
      cta: "Billing oynasini ochish",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),linear-gradient(135deg,#ffffff_0%,#eff6ff_50%,#ffffff_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <Sparkles className="h-4 w-4" />
                Personal control center
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
                {displayName} uchun kuchli settings workspace
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400">
                Profil, ko'rinish, xavfsizlik va billing qatlamlari endi alohida
                boshqaruv sahifalari bilan backendga ulangan.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
                  {profile?.role ?? "student"}
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
                  {preferences.language_pref.toUpperCase()}
                </span>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
                  {formatThemeLabel(preferences.theme_pref)}
                </span>
                {profile?.company_name ? (
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
                    {profile.company_name}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
              {[
                {
                  label: "Faol accesslar",
                  value: (enrollmentsCount ?? 0).toString(),
                },
                { label: "Buyurtmalar", value: (orderCount ?? 0).toString() },
                {
                  label: "Til",
                  value: preferences.language_pref.toUpperCase(),
                },
                {
                  label: "Theme",
                  value: formatThemeLabel(preferences.theme_pref),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-gray-200 bg-white/90 px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/90"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-black text-gray-950 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {setupCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
          >
            <div
              className={`bg-gradient-to-br ${card.accent} p-6`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-gray-900">
                <card.icon className="h-5 w-5 text-gray-900 dark:text-white" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-gray-950 dark:text-white">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-blue-400">
                {card.cta}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Security trail
              </p>
              <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                So'nggi account faoliyati
              </h2>
            </div>
            <Link
              href="/settings/security"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              Hammasini ko'rish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentActivity.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-sm leading-7 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                Hali activity loglar yo'q. Profil va xavfsizlik bo'yicha keyingi
                o'zgarishlar shu yerda paydo bo'ladi.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-2 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatActivityLabel(activity.action)}
                    </p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {new Date(activity.created_at).toLocaleString("uz-UZ")}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">
                    {Array.isArray(activity.detail.changedFields) &&
                    activity.detail.changedFields.length > 0
                      ? `Yangilangan maydonlar: ${activity.detail.changedFields.join(", ")}`
                      : "O'zgarish audit jurnaliga muvaffaqiyatli yozildi."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
              <Globe2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Account snapshot
              </p>
              <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                Hozirgi holat
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              {
                label: "Email",
                value: profile?.email ?? user.email ?? "Mavjud emas",
              },
              {
                label: "Role",
                value: profile?.role ?? "student",
              },
              {
                label: "Oxirgi settings sync",
                value: preferences.updated_at
                  ? new Date(preferences.updated_at).toLocaleString("uz-UZ")
                  : "Default qiymatlar ishlayapti",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-medium leading-7 text-gray-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
