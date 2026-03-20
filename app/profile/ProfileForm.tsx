"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

interface ProfileFormProps {
  fullName: string;
}

type FormState = { ok?: boolean; error?: string } | null;

export default function ProfileForm({ fullName }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updateProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          To&apos;liq ism
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName}
          required
          className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          Profil yangilandi
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}
