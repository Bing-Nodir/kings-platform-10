import {
  Activity,
  BellRing,
  CheckCircle2,
  Mail,
  TriangleAlert,
} from "lucide-react";
import NotificationJobStatusSelect from "./NotificationJobStatusSelect";
import {
  formatNotificationStatusLabel,
  getOperationalMonitoringData,
} from "@/lib/server/operations";

const severityMeta = {
  info: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  error: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
} as const;

export default async function AdminOperationsPage() {
  const { summary, recentJobs, recentEvents, error } =
    await getOperationalMonitoringData();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Operations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Transactional notification queue va system event loglar
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          Operational queue yoki event log jadvallari hali tayyor emas. Supabase
          SQL Editor'da `supabase/migrations/20260321_operational_comms_phase4.sql`
          migratsiyasini ishga tushiring.
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Queued jobs",
            value: summary.queuedCount,
            icon: BellRing,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            label: "Sent jobs",
            value: summary.sentCount,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Failed jobs",
            value: summary.failedCount,
            icon: TriangleAlert,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950/30",
          },
          {
            label: "Events",
            value: summary.eventCount,
            icon: Activity,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <div className={`rounded-xl p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Notification queue
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Email, SMS va boshqa providerga yuborilishi kerak bo'lgan ishlar
              </p>
            </div>
            <Mail className="h-4 w-4 text-gray-400" />
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentJobs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
                Hozircha notification joblar yo'q
              </div>
            ) : (
              recentJobs.map((job: {
                id: string;
                channel: string;
                event_type: string;
                status: "queued" | "processing" | "sent" | "failed" | "cancelled";
                recipient: string | null;
                subject: string | null;
                provider: string | null;
                provider_reference: string | null;
                created_at: string;
                error_detail: string | null;
              }) => (
                <div key={job.id} className="px-6 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {job.subject ?? job.event_type}
                        </p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                          {job.channel}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {job.recipient ?? "recipient yo'q"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(job.created_at).toLocaleString("uz-UZ")}
                        {job.provider ? ` - ${job.provider}` : ""}
                        {job.provider_reference ? ` - ${job.provider_reference}` : ""}
                      </p>
                      {job.error_detail ? (
                        <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                          {job.error_detail}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {formatNotificationStatusLabel(job.status)}
                      </span>
                      <NotificationJobStatusSelect
                        jobId={job.id}
                        currentStatus={job.status}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Recent events
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Order, payment, contact va security hodisalari
            </p>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentEvents.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
                Hozircha event loglar yo'q
              </div>
            ) : (
              recentEvents.map((event: {
                id: string;
                scope: string;
                event_type: string;
                severity: "info" | "warning" | "error";
                title: string | null;
                entity_type: string | null;
                entity_id: string | null;
                created_at: string;
                detail: Record<string, unknown>;
              }) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        severityMeta[event.severity] ?? severityMeta.info
                      }`}
                    >
                      {event.severity}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      {event.scope}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold text-gray-900 dark:text-white">
                    {event.title ?? event.event_type}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {event.entity_type ?? "entity"} {event.entity_id ?? ""}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(event.created_at).toLocaleString("uz-UZ")}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
