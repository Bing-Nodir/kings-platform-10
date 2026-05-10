import {
  isInstructorUser,
  requireAuthenticatedPage,
} from "@/lib/server/auth";
import InstructorShell from "@/components/instructor/InstructorShell";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/instructor"
  );

  const hasInstructorAccess = await isInstructorUser(
    supabase,
    user.id,
    user.email
  );

  if (!hasInstructorAccess) {
    return <>{children}</>;
  }

  return <InstructorShell>{children}</InstructorShell>;
}
