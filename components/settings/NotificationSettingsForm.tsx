"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Mail, Megaphone, Save, Smartphone } from "lucide-react";

interface NotificationSettingsFormProps {
  initialValues: {
    email_notifications: boolean;
    push_notifications: boolean;
    marketing_notifications: boolean;
    updated_at: string | null;
  };
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  icon: typeof Bell;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-gray-950">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationSettingsForm({
  initialValues,
}: NotificationSettingsFormProps) {
  const router = useRouter();
  const [baselineValues, setBaselineValues] = useState({
    email_notifications: initialValues.email_notifications,
    push_notifications: initialValues.push_notifications,
    marketing_notifications: initialValues.marketing_notifications,
  });
  const [emailNotifications, setEmailNotifications] = useState(
    initialValues.email_notifications
  );
  const [pushNotifications, setPushNotifications] = useState(
    initialValues.push_notifications
  );
  const [marketingNotifications, setMarketingNotifications] = useState(
    initialValues.marketing_notifications
  );
  const [syncedAt, setSyncedAt] = useState(initialValues.updated_at);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const hasChanges =
    emailNotifications !== baselineValues.email_notifications ||
    pushNotifications !== baselineValues.push_notifications ||
    marketingNotifications !== baselineValues.marketing_notifications;

  const syncLabel = syncedAt
    ? new Date(syncedAt).toLocaleString("uz-UZ")
    : "Default qiymatlar ishlayapti";

  async function handleSave() {
    if (!hasChanges) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          marketing_notifications: marketingNotifications,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            preferences?: {
              email_notifications?: boolean;
              push_notifications?: boolean;
              marketing_notifications?: boolean;
              updated_at?: string | null;
            };
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Notification sozlamalari saqlanmadi.");
      }

      const nextValues = {
        email_notifications:
          payload?.preferences?.email_notifications ?? emailNotifications,
        push_notifications:
          payload?.preferences?.push_notifications ?? pushNotifications,
        marketing_notifications:
          payload?.preferences?.marketing_notifications ??
          marketingNotifications,
      };

      setEmailNotifications(nextValues.email_notifications);
      setPushNotifications(nextValues.push_notifications);
      setMarketingNotifications(nextValues.marketing_notifications);
      setBaselineValues(nextValues);
      setSyncedAt(payload?.preferences?.updated_at ?? new Date().toISOString());
      setSaved(true);
      startTransition(() => {
        router.refresh();
      });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Notification sozlamalari saqlanmadi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Notifications
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
            Xabarnoma oqimlari
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
            Email, push va marketing xabarlarini bir joydan boshqaring. Tanlovlaringiz backendga saqlanadi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
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

      <div className="mb-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        Oxirgi sync: {syncLabel}
      </div>

      <div className="space-y-4">
        <ToggleRow
          label="Email xabarnomalar"
          description="Order, course access va muhim account yangilanishlari email orqali yuboriladi."
          checked={emailNotifications}
          onToggle={() => setEmailNotifications((value) => !value)}
          icon={Mail}
        />
        <ToggleRow
          label="Push xabarnomalar"
          description="Dashboard va o'qish progressi bo'yicha tezkor browser notificationlar."
          checked={pushNotifications}
          onToggle={() => setPushNotifications((value) => !value)}
          icon={Smartphone}
        />
        <ToggleRow
          label="Marketing va launch xabarlari"
          description="Yangi kurslar, product launch va kampaniyalar haqida yangiliklar."
          checked={marketingNotifications}
          onToggle={() => setMarketingNotifications((value) => !value)}
          icon={Megaphone}
        />
      </div>
    </div>
  );
}
