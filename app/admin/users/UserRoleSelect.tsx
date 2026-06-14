"use client";

import { useTransition } from "react";
import { PRIMARY_ADMIN_EMAIL, isPrimaryAdminEmail } from "@/lib/admin-access";
import { updateUserRole } from "./actions";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Admin" },
] as const;

type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

export default function UserRoleSelect({
  userId,
  currentRole,
  email,
}: {
  userId: string;
  currentRole: RoleValue;
  email: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isPrimaryAdmin = isPrimaryAdminEmail(email);

  return (
    <select
      value={currentRole}
      disabled={isPending || isPrimaryAdmin}
      title={
        isPrimaryAdmin
          ? `Asosiy admin emaili doim admin bo'lib qoladi: ${PRIMARY_ADMIN_EMAIL}`
          : undefined
      }
      onChange={(event) => {
        const nextRole = event.target.value as RoleValue;
        if (nextRole === currentRole) return;

        startTransition(() => {
          updateUserRole(userId, nextRole);
        });
      }}
      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none transition disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
    >
      {ROLE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
