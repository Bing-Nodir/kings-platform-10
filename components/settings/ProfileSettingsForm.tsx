"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Save } from "lucide-react";

interface ProfileSettingsFormProps {
  profile: {
    full_name: string;
    email: string;
    phone: string;
    bio: string;
    company_name: string;
  };
}

export default function ProfileSettingsForm({
  profile,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const [baselineProfile, setBaselineProfile] = useState(profile);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [companyName, setCompanyName] = useState(profile.company_name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const hasChanges =
    fullName.trim() !== baselineProfile.full_name.trim() ||
    phone.trim() !== baselineProfile.phone.trim() ||
    bio.trim() !== baselineProfile.bio.trim() ||
    companyName.trim() !== baselineProfile.company_name.trim();

  async function handleSave() {
    if (!hasChanges) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          company_name: companyName.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Profilni saqlashda xato yuz berdi.");
      }

      setBaselineProfile({
        ...baselineProfile,
        full_name: fullName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        company_name: companyName.trim(),
      });
      setFullName((current) => current.trim());
      setPhone((current) => current.trim());
      setBio((current) => current.trim());
      setCompanyName((current) => current.trim());
      setSaved(true);
      startTransition(() => {
        router.refresh();
      });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Profilni saqlashda xato yuz berdi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Profile settings
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
            Shaxsiy ma&apos;lumotlar
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
            Ism, aloqa va professional bio ma&apos;lumotlaringiz profilingiz va dashboard tajribasini boyitadi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saqlanmoqda..." : saved ? "Saqlandi" : "Saqlash"}
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            To&apos;liq ism
          </label>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            value={profile.email}
            disabled
            className="h-12 w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Telefon
          </label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+998 90 000 00 00"
            className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
          />
        </div>

        <div className="space-y-1.5">
          <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Building2 className="h-4 w-4" />
            Kompaniya
          </label>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Kompaniya nomi"
            className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            placeholder="O'zingiz va professional maqsadlaringiz haqida qisqacha yozing."
            className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
          />
        </div>
      </div>
    </div>
  );
}
