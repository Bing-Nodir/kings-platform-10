import { requireAdminPage } from "@/lib/server/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireAdminPage({
    loginRedirect: "/login?redirect=/admin",
    fallbackRedirect: "/dashboard",
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AdminShell
      adminUser={{
        name: profile?.full_name || user.email || "Admin",
        email: profile?.email || user.email || "",
      }}
    >
      {children}
    </AdminShell>
  );
}
