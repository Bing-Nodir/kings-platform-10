import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Brain,
  Database,
  Globe,
  Shield,
} from "lucide-react";
import { getBackendStatusData } from "@/lib/server/metrics";

export default async function AdminSettingsPage() {
  const status = await getBackendStatusData();
  const sections = [
    {
      icon: Database,
      title: "Backend readiness",
      description: "Supabase, migration va operational jadvallar holati",
      fields: [
        {
          label: "Tayyor checklar",
          value: `${status.readyCount}/${status.totalChecks}`,
        },
        {
          label: "Foydalanuvchilar",
          value: status.summary.totalUsers.toLocaleString(),
        },
        {
          label: "Enrollments",
          value: status.summary.totalEnrollments.toLocaleString(),
        },
        {
          label: "Preferences",
          value: status.summary.totalPreferenceProfiles.toLocaleString(),
        },
        {
          label: "Payment intents",
          value: status.summary.totalPaymentIntents.toLocaleString(),
        },
        {
          label: "Notification jobs",
          value: status.summary.totalNotificationJobs.toLocaleString(),
        },
        {
          label: "Course submissions",
          value: status.summary.totalCourseSubmissions.toLocaleString(),
        },
        {
          label: "Content bootstrap",
          value: "/api/admin/content/bootstrap",
        },
      ],
      action: { href: "/api/health/ready", label: "Readiness JSONni ochish" },
    },
    {
      icon: Bell,
      title: "Operational channels",
      description: "Lead, order va support oqimlari bo'yicha jonli hisoblar",
      fields: [
        {
          label: "Buyurtmalar",
          value: status.summary.totalOrders.toLocaleString(),
        },
        {
          label: "Murojaatlar",
          value: status.summary.totalMessages.toLocaleString(),
        },
        {
          label: "Queue navbatda",
          value: status.summary.queuedNotificationJobs.toLocaleString(),
        },
        {
          label: "Queue xatolar",
          value: status.summary.failedNotificationJobs.toLocaleString(),
        },
        {
          label: "Event loglar",
          value: status.summary.totalOperationalEvents.toLocaleString(),
        },
        {
          label: "Review queue",
          value: status.summary.pendingCourseReviews.toLocaleString(),
        },
        { label: "Operations hub", value: "/admin/operations" },
      ],
      action: { href: "/admin/operations", label: "Operations markazini ochish" },
    },
    {
      icon: Shield,
      title: "Security & AI",
      description: "Auth, admin gate va AI konfiguratsiya bo'yicha audit",
      fields: [
        { label: "Admin gate", value: "Proxy va layout ichida tekshiriladi" },
        {
          label: "AI Mentor",
          value:
            status.checks.find((check) => check.key === "anthropic-env")?.detail ??
            "Status aniqlanmadi",
        },
        {
          label: "Webhook route",
          value: "/api/payments/webhook/[provider]",
        },
        {
          label: "Security logs",
          value: status.summary.totalSecurityEvents.toLocaleString(),
        },
        {
          label: "Delivery providers",
          value: "Queue tayyor, real email/SMS provider ulanishi kutilmoqda",
        },
        { label: "Legal pages", value: "/privacy va /terms tayyor" },
      ],
      action: { href: "/privacy", label: "Yuridik sahifani ochish" },
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sozlamalar va monitoring
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Backend, environment va operational oqimlar bo'yicha jonli audit
        </p>
      </div>

      <div className="mb-6 max-w-4xl rounded-2xl border border-blue-100 bg-blue-50/80 px-5 py-4 text-sm leading-7 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
        Oxirgi tekshiruv: {new Date(status.generatedAt).toLocaleString("uz-UZ")}.
        Hozir {status.readyCount} ta qatlam tayyor, {status.totalChecks - status.readyCount} ta qatlam esa e'tibor talab qiladi.
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <section.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-xs text-gray-400">{section.description}</p>
              </div>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {section.fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  <span className="max-w-xs text-right text-sm text-gray-500 dark:text-gray-400">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
              <Link
                href={section.action.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {section.action.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Backend checks
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Real environment va database readiness natijalari
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <Activity className="h-3.5 w-3.5" />
            Live status
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {status.checks.map((check) => (
            <div
              key={check.key}
              className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-start md:justify-between"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${
                    check.ready
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300"
                  }`}
                >
                  {check.key.includes("ai") ? (
                    <Brain className="h-4 w-4" />
                  ) : check.key.includes("env") ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {check.label}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {check.detail}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  check.ready
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                }`}
              >
                {check.ready ? "Ready" : "Needs attention"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
