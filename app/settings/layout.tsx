import { requireAuthenticatedPage } from "@/lib/server/auth";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings"
  );
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Foydalanuvchi";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_44%,#000000_100%)]">
      <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <SettingsSidebar
            displayName={displayName}
            email={profile?.email ?? user.email ?? "email topilmadi"}
            role={profile?.role ?? "student"}
          />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
