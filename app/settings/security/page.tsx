import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import AccountExportCard from "@/components/settings/AccountExportCard";
import SecurityPasswordForm from "@/components/settings/SecurityPasswordForm";
import { requireAuthenticatedPage } from "@/lib/server/auth";
import { getSecurityAuditLogs } from "@/lib/server/settings";

function formatActivityLabel(action: string) {
  if (action === "profile_updated") return "Profil yangilandi";
  if (action === "preferences_updated") return "Preferences yangilandi";
  if (action === "password_changed") return "Parol yangilandi";
  return action.replaceAll("_", " ");
}

export default async function SettingsSecurityPage() {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings/security"
  );

  const [{ data: profile }, logs] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .maybeSingle(),
    getSecurityAuditLogs(user.id, { limit: 12 }, supabase),
  ]);

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Foydalanuvchi";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.24),transparent_30%),linear-gradient(180deg,#020617_0%,#1f2937_100%)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
            Security center
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
            Account xavfsizligini mustahkamlang
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Parolni yangilash oqimi va audit trail backendda yuritiladi. Bu bo'lim
            phase 1 dagi chala security flowlarni to'liq yakunlaydi.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Foydalanuvchi
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-950 dark:text-white">
                    {displayName}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Audit eventlar
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-950 dark:text-white">
                    {logs.length} ta so'nggi yozuv
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Account role
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-950 dark:text-white">
                    {profile?.role ?? "student"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SecurityPasswordForm />
        <AccountExportCard />
      </div>

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
            Security audit
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
            So'nggi xavfsizlik faoliyati
          </h2>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-sm leading-7 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Hali audit log yozuvlari yo'q. Parol yoki settings yangilansa shu yerda
              tarix paydo bo'ladi.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatActivityLabel(log.action)}
                  </p>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleString("uz-UZ")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
                  {Array.isArray(log.detail.changedFields) &&
                  log.detail.changedFields.length > 0
                    ? `Maydonlar: ${log.detail.changedFields.join(", ")}`
                    : "O'zgarish security audit logga yozilgan."}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
