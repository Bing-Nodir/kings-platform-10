"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Monitor, Moon, Save, Sparkles, Sun } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LOCALE_FLAGS, LOCALE_LABELS } from "@/lib/i18n";
import { applyThemePreference, type ThemePreference } from "@/lib/theme";
const LOCALE_EVENT = "kings-locale-change";
const LOCALE_STORAGE_KEY = "kings_locale";

const themes: Array<{
  id: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { id: "light", label: "Yorug'", description: "Klassik yorug' ko'rinish", icon: Sun },
  { id: "dark", label: "Qorong'i", description: "Ko'zga yengil tun rejimi", icon: Moon },
  {
    id: "midnight",
    label: "Midnight",
    description: "Ko'kimtir premium tun atmosferasi",
    icon: Sparkles,
  },
  { id: "system", label: "Tizim", description: "Qurilma sozlamasiga mos", icon: Monitor },
];

function applyLocale(locale: Locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

interface AppearanceSettingsFormProps {
  initialTheme: ThemePreference;
  initialLocale: Locale;
  lastSyncedAt: string | null;
}

export default function AppearanceSettingsForm({
  initialTheme,
  initialLocale,
  lastSyncedAt,
}: AppearanceSettingsFormProps) {
  const router = useRouter();
  const [baselineTheme, setBaselineTheme] = useState(initialTheme);
  const [baselineLocale, setBaselineLocale] = useState(initialLocale);
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [syncedAt, setSyncedAt] = useState(lastSyncedAt);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const hasChanges = theme !== baselineTheme || locale !== baselineLocale;

  const syncLabel = syncedAt
    ? new Date(syncedAt).toLocaleString("uz-UZ")
    : "Hali backendga sync qilinmagan";

  async function handleSave() {
    if (!hasChanges) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      applyThemePreference(theme);
      applyLocale(locale);

      const response = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme_pref: theme,
          language_pref: locale,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            preferences?: {
              updated_at?: string | null;
              theme_pref?: ThemePreference;
              language_pref?: Locale;
            };
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Ko'rinish sozlamalari saqlanmadi.");
      }

      const nextTheme = payload?.preferences?.theme_pref ?? theme;
      const nextLocale = payload?.preferences?.language_pref ?? locale;

      setTheme(nextTheme);
      setLocale(nextLocale);
      setBaselineTheme(nextTheme);
      setBaselineLocale(nextLocale);
      setSyncedAt(payload?.preferences?.updated_at ?? new Date().toISOString());
      setSaved(true);
      startTransition(() => {
        router.refresh();
      });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Ko'rinish sozlamalari saqlanmadi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
              Appearance
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
              Ko&apos;rinish va til
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Theme va til tanlovi backendga saqlanadi va barcha future sessionlar uchun tayyor bo&apos;ladi.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saqlanmoqda..." : saved ? "Saqlandi" : "Saqlash"}
          </button>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Oxirgi sync: {syncLabel}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {themes.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setTheme(option.id);
                applyThemePreference(option.id);
              }}
              className={`rounded-[1.5rem] border p-5 text-left transition-all ${
                theme === option.id
                  ? "border-purple-500 bg-purple-50 shadow-sm dark:border-purple-500/60 dark:bg-purple-950/25"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950"
              }`}
            >
              <option.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="mt-4 text-lg font-bold text-gray-950 dark:text-white">
                {option.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-950 dark:text-white">
              Platforma tili
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Til tanlovi navigatsiya va user UI matnlariga qo&apos;llanadi.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(["uz", "ru", "en"] as Locale[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setLocale(option);
                applyLocale(option);
              }}
              className={`rounded-[1.5rem] border p-5 text-left transition-all ${
                locale === option
                  ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-500/60 dark:bg-blue-950/25"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950"
              }`}
            >
              <div className="text-3xl">{LOCALE_FLAGS[option]}</div>
              <h3 className="mt-4 text-lg font-bold text-gray-950 dark:text-white">
                {LOCALE_LABELS[option]}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {option === "uz"
                  ? "Mahalliy O'zbek tajribasi"
                  : option === "ru"
                    ? "Rus tilidagi professional UI"
                    : "English-friendly workspace"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
