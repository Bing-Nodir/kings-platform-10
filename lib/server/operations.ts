import { getUserPreferences } from "@/lib/server/settings"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

type DataClient = Pick<Awaited<ReturnType<typeof createClient>>, "from">

export const NOTIFICATION_JOB_STATUSES = [
  "queued",
  "processing",
  "sent",
  "failed",
  "cancelled",
] as const

export type NotificationJobStatus = (typeof NOTIFICATION_JOB_STATUSES)[number]

export function formatNotificationStatusLabel(status: string) {
  if (status === "sent") return "Yuborilgan"
  if (status === "processing") return "Jarayonda"
  if (status === "failed") return "Xato"
  if (status === "cancelled") return "Bekor qilingan"
  return "Navbatda"
}

function asRecord(value: Record<string, unknown> | undefined) {
  return value ?? {}
}

async function resolveWriterClient(options?: {
  supabase?: DataClient
  preferAdmin?: boolean
}) {
  if (options?.supabase) {
    return options.supabase
  }

  if (options?.preferAdmin) {
    try {
      return createAdminClient()
    } catch {
      return null
    }
  }

  return createClient()
}

export async function safeRecordOperationalEvent(
  input: {
    userId?: string | null
    scope: "order" | "payment" | "security" | "contact" | "support" | "notification" | "system"
    eventType: string
    severity?: "info" | "warning" | "error"
    entityType?: string
    entityId?: string
    title?: string
    detail?: Record<string, unknown>
    dedupeKey?: string
  },
  options?: {
    supabase?: DataClient
    preferAdmin?: boolean
  }
) {
  const client = await resolveWriterClient(options)

  if (!client) {
    return { ok: false as const, skipped: true as const }
  }

  const { error } = await client.from("operational_events").insert({
    user_id: input.userId ?? null,
    scope: input.scope,
    event_type: input.eventType,
    severity: input.severity ?? "info",
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    title: input.title ?? null,
    detail: asRecord(input.detail),
    dedupe_key: input.dedupeKey ?? null,
  })

  if (error?.code === "23505") {
    return { ok: true as const, duplicate: true as const }
  }

  if (error) {
    return { ok: false as const, error }
  }

  return { ok: true as const }
}

export async function safeQueueNotificationJob(
  input: {
    userId?: string | null
    channel: "email" | "sms" | "in_app" | "webhook"
    eventType: string
    recipient?: string | null
    subject?: string | null
    templateKey?: string | null
    provider?: string | null
    payload?: Record<string, unknown>
    dedupeKey?: string
    status?: NotificationJobStatus
  },
  options?: {
    supabase?: DataClient
    preferAdmin?: boolean
  }
) {
  const client = await resolveWriterClient(options)

  if (!client) {
    return { ok: false as const, skipped: true as const }
  }

  const { error } = await client.from("notification_jobs").insert({
    user_id: input.userId ?? null,
    channel: input.channel,
    event_type: input.eventType,
    status: input.status ?? "queued",
    recipient: input.recipient ?? null,
    subject: input.subject ?? null,
    template_key: input.templateKey ?? null,
    provider: input.provider ?? null,
    payload: asRecord(input.payload),
    dedupe_key: input.dedupeKey ?? null,
  })

  if (error?.code === "23505") {
    return { ok: true as const, duplicate: true as const }
  }

  if (error) {
    return { ok: false as const, error }
  }

  return { ok: true as const }
}

export async function safeQueueUserEmailNotification(
  input: {
    userId?: string | null
    email?: string | null
    eventType: string
    subject: string
    payload?: Record<string, unknown>
    dedupeKey?: string
    force?: boolean
  },
  options?: {
    supabase?: DataClient
    preferAdmin?: boolean
  }
) {
  if (!input.email) {
    return { ok: false as const, skipped: true as const }
  }

  if (input.userId && !input.force) {
    try {
      const preferences = await getUserPreferences(
        input.userId,
        options?.supabase as Awaited<ReturnType<typeof createClient>> | undefined
      )

      if (!preferences.email_notifications) {
        return { ok: false as const, skipped: true as const }
      }
    } catch {
      // Preference lookup is best-effort. We still queue when lookup fails.
    }
  }

  return safeQueueNotificationJob(
    {
      userId: input.userId,
      channel: "email",
      eventType: input.eventType,
      recipient: input.email,
      subject: input.subject,
      templateKey: input.eventType,
      payload: input.payload,
      dedupeKey: input.dedupeKey,
      provider: "provider_pending",
    },
    options
  )
}

export async function getOperationalMonitoringData(
  supabase?: DataClient
) {
  const client = supabase ?? (await createClient())

  const [
    { count: queuedCount, error: queuedError },
    { count: sentCount, error: sentError },
    { count: failedCount, error: failedError },
    { count: eventCount, error: eventCountError },
    { data: recentJobs, error: jobsError },
    { data: recentEvents, error: eventsError },
  ] = await Promise.all([
    client
      .from("notification_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "queued"),
    client
      .from("notification_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent"),
    client
      .from("notification_jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    client.from("operational_events").select("*", { count: "exact", head: true }),
    client
      .from("notification_jobs")
      .select(
        "id, channel, event_type, status, recipient, subject, provider, provider_reference, created_at, error_detail"
      )
      .order("created_at", { ascending: false })
      .limit(12),
    client
      .from("operational_events")
      .select(
        "id, scope, event_type, severity, title, entity_type, entity_id, created_at, detail"
      )
      .order("created_at", { ascending: false })
      .limit(12),
  ])

  const error =
    queuedError?.message ??
    sentError?.message ??
    failedError?.message ??
    eventCountError?.message ??
    jobsError?.message ??
    eventsError?.message ??
    null

  return {
    error,
    summary: {
      queuedCount: queuedCount ?? 0,
      sentCount: sentCount ?? 0,
      failedCount: failedCount ?? 0,
      eventCount: eventCount ?? 0,
    },
    recentJobs: recentJobs ?? [],
    recentEvents: recentEvents ?? [],
  }
}
