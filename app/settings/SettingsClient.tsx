"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Globe,
  Lock,
  Moon,
  Palette,
  Save,
  Sun,
  User,
  Monitor,
  Check,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { LOCALE_FLAGS, LOCALE_LABELS, type Locale } from "@/lib/i18n";

interface Props {
  userId: string;
  email: string;
  profile: {
    full_name: string;
    phone: string;
    bio: string;
    company_name: string;
    language_pref: Locale;
    role: string;
  };
}

const LOCALES: Locale[] = ["uz", "ru", "en"];
const THEMES = [
  { id: "light", label: "Yorug'", labelRu: "Светлая", labelEn: "Light", icon: Sun },
  { id: "dark", label: "Qorong'i", labelRu: "Тёмная", labelEn: "Dark", icon: Moon },
  { id: "system", label: "Tizim", labelRu: "Системная", labelEn: "System", icon: Monitor },
] as const;

type ThemeId = "light" | "dark" | "system";

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "system";
  const t = localStorage.getItem("theme");
  if (t === "dark" || t === "light") return t;
  return "system";
}

function applyTheme(theme: ThemeId) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    localStorage.removeItem("theme");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export default function SettingsClient({ userId, email, profile }: Props) {
  const { locale, setLocale, t } = useLanguage();

  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== "undefined") return getStoredTheme();
    return "system";
  });

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [companyName, setCompanyName] = useState(profile.company_name);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleThemeChange(t: ThemeId) {
    setThemeState(t);
    applyTheme(t);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          company_name: companyName.trim(),
          language_pref: locale,
        }),
      });
      if (!res.ok) throw new Error("Saqlashda xato");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Xato yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  }

  const sectionClass =
    "rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950";
  const headerClass =
    "flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800";
  const iconBoxClass = (color: string) =>
    `flex h-8 w-8 items-center justify-center rounded-xl ${color}`;

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 dark:bg-black md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common", "back")}
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 disabled:opacity-60"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> {t("common", "saved")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saving ? t("common", "saving") : t("common", "save")}
              </>
            )}
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {t("settings", "title")}
          </h1>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* ── Profile Info ─────────────────────────────── */}
        <div className={sectionClass}>
          <div className={headerClass}>
            <div className={iconBoxClass("bg-blue-100 dark:bg-blue-950/40")}>
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t("profile", "editProfile")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Shaxsiy ma&apos;lumotlar
              </p>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile", "fullName")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile", "email")}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-900"
              />
              <p className="mt-1 text-xs text-gray-400">{t("profile", "emailNote")}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile", "phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 000 00 00"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("profile", "bio")}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="O'zingiz haqingizda qisqacha..."
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {t("profile", "companyName")}
                </span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Kompaniya nomi (ixtiyoriy)"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
              />
            </div>
          </div>
        </div>

        {/* ── Language ──────────────────────────────────── */}
        <div className={sectionClass}>
          <div className={headerClass}>
            <div className={iconBoxClass("bg-purple-100 dark:bg-purple-950/40")}>
              <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t("settings", "language")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("settings", "languageDesc")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 p-6">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-sm font-medium transition-all ${
                  locale === loc
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                <span className="text-2xl">{LOCALE_FLAGS[loc]}</span>
                <span>{LOCALE_LABELS[loc]}</span>
                {locale === loc && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Theme ────────────────────────────────────── */}
        <div className={sectionClass}>
          <div className={headerClass}>
            <div className={iconBoxClass("bg-amber-100 dark:bg-amber-950/40")}>
              <Palette className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t("settings", "theme")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("settings", "themeDesc")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 p-6">
            {THEMES.map((th) => {
              const label =
                locale === "ru"
                  ? th.labelRu
                  : locale === "en"
                    ? th.labelEn
                    : th.label;
              return (
                <button
                  key={th.id}
                  onClick={() => handleThemeChange(th.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-sm font-medium transition-all ${
                    theme === th.id
                      ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-300"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  <th.icon className="h-6 w-6" />
                  <span>{label}</span>
                  {theme === th.id && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notifications ──────────────────────────── */}
        <div className={sectionClass}>
          <div className={headerClass}>
            <div className={iconBoxClass("bg-emerald-100 dark:bg-emerald-950/40")}>
              <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t("settings", "notifications")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("settings", "notifDesc")}
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[
              { label: t("settings", "notifEmail"), value: notifEmail, set: setNotifEmail },
              { label: t("settings", "notifPush"), value: notifPush, set: setNotifPush },
              { label: t("settings", "notifMarketing"), value: notifMarketing, set: setNotifMarketing },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-6 py-4"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <button
                  onClick={() => item.set(!item.value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    item.value
                      ? "bg-blue-600"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      item.value ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security ────────────────────────────────── */}
        <div className={sectionClass}>
          <div className={headerClass}>
            <div className={iconBoxClass("bg-gray-100 dark:bg-gray-800")}>
              <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t("settings", "account")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("settings", "accountDesc")}
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hisob ID
              </p>
              <p className="mt-1 font-mono text-xs text-gray-400">{userId}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
