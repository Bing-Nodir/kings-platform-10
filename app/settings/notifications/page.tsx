import { Bell, Mail, Megaphone, Smartphone } from "lucide-react";
import NotificationSettingsForm from "@/components/settings/NotificationSettingsForm";
import { requireAuthenticatedPage } from "@/lib/server/auth";
import { getUserPreferences } from "@/lib/server/settings";

export default async function SettingsNotificationsPage() {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings/notifications"
  );
  const preferences = await getUserPreferences(user.id, supabase);

  const toggles = [
    {
      label: "Email alerts",
      value: preferences.email_notifications,
      icon: Mail,
      activeLabel: "Aktiv",
      inactiveLabel: "O'chirilgan",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Push alerts",
      value: preferences.push_notifications,
      icon: Smartphone,
      activeLabel: "Aktiv",
      inactiveLabel: "O'chirilgan",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Marketing",
      value: preferences.marketing_notifications,
      icon: Megaphone,
      activeLabel: "Yoqilgan",
      inactiveLabel: "O'chirilgan",
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),linear-gradient(180deg,#020617_0%,#052e16_100%)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Notification settings
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
            Xabarnoma oqimlarini nozik boshqaring
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Bu bo'lim email, push va marketing signallarini backendda saqlaydi,
            shuning uchun account tajribasi barcha sessionlarda bir xil qoladi.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {toggles.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90"
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                      {item.value ? item.activeLabel : item.inactiveLabel}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NotificationSettingsForm
        initialValues={{
          email_notifications: preferences.email_notifications,
          push_notifications: preferences.push_notifications,
          marketing_notifications: preferences.marketing_notifications,
          updated_at: preferences.updated_at,
        }}
      />

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950 dark:text-white">
              Backend-ready notification layer
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Provider integratsiyasi keyingi bosqichda qo'shilsa ham, user preference
              qatlami hozirdan tayyor va auditga yoziladi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
