import { Building2, Mail, Shield, UserRound } from "lucide-react";
import { requireAuthenticatedPage } from "@/lib/server/auth";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";

export default async function SettingsProfilePage() {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings/profile"
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, bio, company_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const profileData = {
    full_name: profile?.full_name ?? user.email?.split("@")[0] ?? "",
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? "",
    bio: profile?.bio ?? "",
    company_name: profile?.company_name ?? "",
  };

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Yangi foydalanuvchi";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_32%),linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Profile settings
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
            Profil ma'lumotlarini yangilang
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Kontakt va professional ma'lumotlaringiz dashboard, checkout va
            kelajakdagi business integrations uchun markaziy profil sifatida
            xizmat qiladi.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <UserRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profileData.full_name || "Ism kiritilmagan"}
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profileData.email}
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profile?.role ?? "student"} | {joinedAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProfileSettingsForm profile={profileData} />

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-950/30">
            <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950 dark:text-white">
              Professional context
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kompaniya va bio ma'lumotlari keyingi bosqichdagi korporativ
              backend oqimlari uchun foydali bo'ladi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
