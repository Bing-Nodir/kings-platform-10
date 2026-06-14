import { Globe, Palette } from "lucide-react";
import AppearanceSettingsForm from "@/components/settings/AppearanceSettingsForm";
import { requireAuthenticatedPage } from "@/lib/server/auth";
import { getUserPreferences } from "@/lib/server/settings";
import { formatThemeLabel } from "@/lib/theme";

export default async function SettingsAppearancePage() {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings/appearance"
  );
  const preferences = await getUserPreferences(user.id, supabase);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.26),transparent_30%),linear-gradient(180deg,#020617_0%,#111827_100%)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
            Ko'rinish sozlamalari
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
            Ko'rinish va til boshqaruvi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Theme va lokal sozlamalar browser ichida darhol qo'llanadi, shu bilan birga
            backendga saqlanib keyingi sessiyalarda ham tiklanadi.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Joriy theme
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                    {formatThemeLabel(preferences.theme_pref)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Joriy til
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                    {preferences.language_pref.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AppearanceSettingsForm
        initialTheme={preferences.theme_pref}
        initialLocale={preferences.language_pref}
        lastSyncedAt={preferences.updated_at}
      />
    </div>
  );
}
