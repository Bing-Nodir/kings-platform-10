"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LockKeyhole, Save, ShieldAlert } from "lucide-react";

function getPasswordChecks(password: string) {
  return [
    {
      label: "Kamida 8 belgi",
      passed: password.length >= 8,
    },
    {
      label: "Katta va kichik harf",
      passed: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      label: "Raqam",
      passed: /\d/.test(password),
    },
    {
      label: "Maxsus belgi",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

function getStrengthTone(score: number) {
  if (score >= 4) {
    return {
      label: "Kuchli",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    };
  }

  if (score >= 2) {
    return {
      label: "O'rtacha",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    };
  }

  return {
    label: "Zaif",
    className: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
  };
}

export default function SecurityPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const checks = getPasswordChecks(newPassword);
  const passedChecks = checks.filter((check) => check.passed).length;
  const strengthTone = getStrengthTone(passedChecks);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = passedChecks === checks.length && passwordsMatch;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      if (!newPassword || !confirmPassword) {
        throw new Error("Parol maydonlarini to'ldiring");
      }

      if (newPassword.length < 8) {
        throw new Error("Yangi parol kamida 8 ta belgidan iborat bo'lsin");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Parollar bir xil emas");
      }

      const response = await fetch("/api/settings/security/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Parolni yangilashda xato yuz berdi.");
      }

      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      startTransition(() => {
        router.refresh();
      });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Parolni yangilashda xato yuz berdi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
            Security
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
            Parolni yangilash
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
            Aktiv session orqali yangi parol o&apos;rnatiladi va o&apos;zgarish security audit logga yoziladi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !canSubmit}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saqlanmoqda..." : saved ? "Yangilandi" : "Parolni saqlash"}
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mb-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Kuchli parol uchun kamida 8 ta belgi, katta-kichik harf, raqam va maxsus belgilar kombinatsiyasidan foydalaning.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Yangi parol
          </label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Parolni tasdiqlang
          </label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Parol kuchi
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Saqlash tugmasi barcha talablar bajarilganda faollashadi.
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${strengthTone.className}`}
          >
            {strengthTone.label}
          </span>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className={`rounded-2xl border px-3 py-2 text-sm ${
                check.passed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400"
              }`}
            >
              {check.label}
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm">
          <span
            className={
              passwordsMatch
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-gray-500 dark:text-gray-400"
            }
          >
            {passwordsMatch
              ? "Parollar mos keladi."
              : "Parollar bir xil bo'lishi kerak."}
          </span>
        </div>
      </div>
    </div>
  );
}
