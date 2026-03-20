import { requireAdminPage } from "@/lib/server/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage({
    loginRedirect: "/login?redirect=/admin",
    fallbackRedirect: "/dashboard",
  });

  return <AdminShell>{children}</AdminShell>;
}
