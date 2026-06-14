import { lookup } from "node:dns/promises";
import { getAnthropicConfig, hasConfiguredAnthropicKey } from "@/lib/server/env";
import { createPublicClient } from "@/utils/supabase/public";
import {
  getSupabaseAdminConfig,
  getSupabasePublicConfig,
} from "@/utils/supabase/config";

const DEFAULT_HEALTH_TIMEOUT_MS = 4_000;

export interface HealthCheck {
  key: string;
  label: string;
  ready: boolean;
  detail: string;
  latencyMs?: number;
  code?: string;
}

export interface SystemHealthReport {
  status: "ok" | "degraded";
  checks: HealthCheck[];
  services: {
    supabaseEnv: boolean;
    supabaseAdminEnv: boolean;
    publicDatabase: boolean;
    profiles: boolean;
    siteContent: boolean;
    siteDocuments: boolean;
    structuredContentLive: boolean;
    paymentIntents: boolean;
    aiMentorConfigured: boolean;
    databaseConnectionEnv: boolean;
  };
  content: {
    source: "database" | "seed";
    publishedDocuments: number;
    byKind: Partial<Record<string, number>>;
  };
  model: string | null;
  checkedAt: string;
}

export interface LivenessReport {
  status: "ok";
  uptimeSeconds: number;
  checkedAt: string;
}

function getHealthTimeoutMs() {
  const value = Number(process.env.BACKEND_HEALTH_TIMEOUT_MS);
  return Number.isFinite(value) && value >= 500 && value <= 15_000
    ? value
    : DEFAULT_HEALTH_TIMEOUT_MS;
}

function classifyError(error: unknown, fallback: string) {
  const cause =
    error && typeof error === "object" && "cause" in error
      ? (error as { cause?: { code?: string; message?: string } }).cause
      : undefined;
  const code =
    cause?.code ??
    (error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : undefined);

  if (code === "ENOTFOUND") {
    return {
      code,
      detail:
        "Supabase host DNS topilmadi. NEXT_PUBLIC_SUPABASE_URL qiymatini tekshiring yoki Supabase project active ekanini tasdiqlang.",
    };
  }

  if (code === "ETIMEDOUT" || code === "ECONNRESET" || code === "EAI_AGAIN") {
    return {
      code,
      detail:
        "Supabase tarmoq ulanishida vaqtinchalik xato. Internet/DNS/firewall holatini tekshiring.",
    };
  }

  if (code === "PGRST205" || code === "42P01") {
    return {
      code,
      detail:
        "Supabase schema cache'da kerakli jadval topilmadi. Migrationlar shu projectga qo'llanmagan yoki PostgREST schema cache yangilanmagan.",
    };
  }

  if (error instanceof Error && error.name === "AbortError") {
    return {
      code: "TIMEOUT",
      detail: `${fallback} timeout bo'ldi.`,
    };
  }

  if (error instanceof Error && error.message === "HEALTH_CHECK_TIMEOUT") {
    return {
      code: "TIMEOUT",
      detail: `${fallback} timeout bo'ldi.`,
    };
  }

  if (error && typeof error === "object" && "message" in error) {
    return {
      code,
      detail: String((error as { message?: unknown }).message || fallback),
    };
  }

  return {
    code,
    detail:
      error instanceof Error
        ? cause?.message
          ? `${error.message}: ${cause.message}`
          : error.message
        : fallback,
  };
}

async function runCheck(
  key: string,
  label: string,
  task: (signal: AbortSignal) => Promise<string>
): Promise<HealthCheck> {
  const controller = new AbortController();
  const startedAt = Date.now();
  const timeoutMs = getHealthTimeoutMs();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const detail = await Promise.race([
      task(controller.signal),
      new Promise<string>((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("HEALTH_CHECK_TIMEOUT"));
        }, timeoutMs);
      }),
    ]);

    return {
      key,
      label,
      ready: true,
      detail,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    const classified = classifyError(error, `${label} xatosi`);

    return {
      key,
      label,
      ready: false,
      detail: classified.detail,
      code: classified.code,
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function skippedCheck(key: string, label: string, detail: string): HealthCheck {
  return {
    key,
    label,
    ready: false,
    detail,
    code: "SKIPPED",
  };
}

async function checkSupabaseTable(
  key: string,
  label: string,
  table: string,
  column: string,
  readyDetail: string
) {
  const supabase = createPublicClient();

  return runCheck(key, label, async (signal) => {
    const { error } = await supabase
      .from(table)
      .select(column)
      .limit(1)
      .abortSignal(signal);

    if (error) {
      throw error;
    }

    return readyDetail;
  });
}

async function getLiveSiteDocumentOverview() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_documents")
    .select("kind")
    .eq("status", "published")
    .limit(1_000);

  if (error) {
    throw error;
  }

  const byKind: Partial<Record<string, number>> = {};
  for (const row of data ?? []) {
    const kind = typeof row.kind === "string" ? row.kind : "unknown";
    byKind[kind] = (byKind[kind] ?? 0) + 1;
  }

  const totalPublished = data?.length ?? 0;

  return {
    available: true,
    source: totalPublished > 0 ? ("database" as const) : ("seed" as const),
    totalPublished,
    byKind,
    detail:
      totalPublished > 0
        ? `${totalPublished} ta published document topildi.`
        : "site_documents bo'sh, seed fallback ishlayapti.",
  };
}

function assertEnvCheck(): HealthCheck {
  try {
    getSupabasePublicConfig();

    return {
      key: "supabase-env",
      label: "Supabase environment",
      ready: true,
      detail: "Supabase public URL va anon key topildi.",
    };
  } catch (error) {
    return {
      key: "supabase-env",
      label: "Supabase environment",
      ready: false,
      detail:
        error instanceof Error ? error.message : "Supabase environment topilmadi.",
    };
  }
}

function assertAdminEnvCheck(): HealthCheck {
  try {
    getSupabaseAdminConfig();

    return {
      key: "supabase-admin-env",
      label: "Supabase admin environment",
      ready: true,
      detail: "Supabase service role key topildi.",
    };
  } catch (error) {
    return {
      key: "supabase-admin-env",
      label: "Supabase admin environment",
      ready: false,
      detail:
        error instanceof Error
          ? error.message
          : "Supabase service role key topilmadi.",
    };
  }
}

function assertDatabaseConnectionEnvCheck(): HealthCheck {
  const requiredKeys = ["DATABASE_URL", "DIRECT_URL"];
  const optionalKeys = ["DIRECT_DATABASE_URL_IPV6"];
  const configuredRequired = requiredKeys.filter((key) => {
    const value = process.env[key]?.trim() ?? "";
    return (
      value &&
      !value.includes("[YOUR-PASSWORD]") &&
      !value.toLowerCase().includes("placeholder")
    );
  });
  const configuredOptional = optionalKeys.filter((key) => {
    const value = process.env[key]?.trim() ?? "";
    return (
      value &&
      !value.includes("[YOUR-PASSWORD]") &&
      !value.toLowerCase().includes("placeholder")
    );
  });
  const missing = requiredKeys.filter((key) => !configuredRequired.includes(key));

  if (missing.length > 0) {
    return {
      key: "database-connection-env",
      label: "Postgres connection URLs",
      ready: false,
      code: "PLACEHOLDER",
      detail: `${missing.join(", ")} hali haqiqiy database password bilan to'ldirilmagan. Migration push va SQL lint shu sabab remote DB'ga ulanmaydi.`,
    };
  }

  return {
    key: "database-connection-env",
    label: "Postgres connection URLs",
    ready: true,
    detail:
      configuredOptional.length > 0
        ? "Postgres pooler/direct connection URL'lari to'ldirilgan, IPv6 direct URL ham mavjud."
        : "Postgres pooler/direct connection URL'lari to'ldirilgan. IPv6 direct URL optional.",
  };
}

async function buildSupabaseChecks() {
  const checks: HealthCheck[] = [];
  const envCheck = assertEnvCheck();
  checks.push(envCheck);
  checks.push(assertAdminEnvCheck());
  checks.push(assertDatabaseConnectionEnvCheck());

  if (!envCheck.ready) {
    checks.push(
      skippedCheck(
        "supabase-dns",
        "Supabase DNS",
        "Supabase env tayyor bo'lmagani uchun DNS check o'tkazilmadi."
      ),
      skippedCheck(
        "profiles-table",
        "Profiles table",
        "Supabase env tayyor bo'lmagani uchun profiles check o'tkazilmadi."
      ),
      skippedCheck(
        "site-content",
        "Site content table",
        "Supabase env tayyor bo'lmagani uchun site_content check o'tkazilmadi."
      ),
      skippedCheck(
        "site-documents-table",
        "Site documents table",
        "Supabase env tayyor bo'lmagani uchun site_documents check o'tkazilmadi."
      ),
      skippedCheck(
        "payment-intents",
        "Payment orchestration table",
        "Supabase env tayyor bo'lmagani uchun payment_intents check o'tkazilmadi."
      )
    );

    return checks;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();
  const hostname = new URL(supabaseUrl).hostname;

  const dnsCheck = await runCheck("supabase-dns", "Supabase DNS", async () => {
    await lookup(hostname);
    return "Supabase host DNS orqali topildi.";
  });
  checks.push(dnsCheck);

  const restCheck = await runCheck(
    "supabase-rest",
    "Supabase Auth/REST API",
    async (signal) => {
      const response = await fetch(new URL("/auth/v1/health", supabaseUrl), {
        cache: "no-store",
        headers: {
          apikey: supabaseAnonKey,
        },
        signal,
      });

      if (response.status >= 500) {
        throw new Error(`Supabase REST ${response.status} javob qaytardi.`);
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Supabase Auth/REST ${response.status}: anon key yoki API ruxsatlarini tekshiring.`
        );
      }

      return `Supabase Auth API javob berdi (${response.status}).`;
    }
  );
  checks.push(restCheck);

  if (!dnsCheck.ready || !restCheck.ready) {
    checks.push(
      skippedCheck(
        "profiles-table",
        "Profiles table",
        "Supabase API tayyor bo'lmagani uchun profiles query o'tkazilmadi."
      ),
      skippedCheck(
        "site-content",
        "Site content table",
        "Supabase API tayyor bo'lmagani uchun site_content query o'tkazilmadi."
      ),
      skippedCheck(
        "site-documents-table",
        "Site documents table",
        "Supabase API tayyor bo'lmagani uchun site_documents query o'tkazilmadi."
      ),
      skippedCheck(
        "payment-intents",
        "Payment orchestration table",
        "Supabase API tayyor bo'lmagani uchun payment_intents query o'tkazilmadi."
      )
    );

    return checks;
  }

  checks.push(
    await checkSupabaseTable(
      "profiles-table",
      "Profiles table",
      "profiles",
      "id",
      "profiles jadvali auth/profile lifecycle uchun tayyor."
    )
  );

  checks.push(
    await checkSupabaseTable(
      "site-content",
      "Site content table",
      "site_content",
      "content_key",
      "site_content jadvali public read uchun tayyor."
    )
  );

  checks.push(
    await checkSupabaseTable(
      "site-documents-table",
      "Site documents table",
      "site_documents",
      "id",
      "site_documents jadvali structured content uchun tayyor."
    )
  );

  checks.push(
    await checkSupabaseTable(
      "payment-intents",
      "Payment orchestration table",
      "payment_intents",
      "id",
      "payment_intents jadvali checkout lifecycle uchun tayyor."
    )
  );

  return checks;
}

export function getLivenessReport(): LivenessReport {
  return {
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    checkedAt: new Date().toISOString(),
  };
}

export async function getSystemHealthReport(): Promise<SystemHealthReport> {
  const checks = await buildSupabaseChecks();
  const supabaseEnvReady = checks.find((check) => check.key === "supabase-env")?.ready ?? false;
  const supabaseAdminEnvReady = checks.find((check) => check.key === "supabase-admin-env")?.ready ?? false;
  const databaseConnectionEnvReady = checks.find((check) => check.key === "database-connection-env")?.ready ?? false;
  const supabaseRestReady = checks.find((check) => check.key === "supabase-rest")?.ready ?? false;
  const profilesReady = checks.find((check) => check.key === "profiles-table")?.ready ?? false;
  const siteContentReady = checks.find((check) => check.key === "site-content")?.ready ?? false;
  const siteDocumentsTableReady = checks.find((check) => check.key === "site-documents-table")?.ready ?? false;
  const paymentIntentsReady = checks.find((check) => check.key === "payment-intents")?.ready ?? false;
  const publicDatabaseReady =
    supabaseRestReady &&
    profilesReady &&
    siteContentReady &&
    siteDocumentsTableReady &&
    paymentIntentsReady;

  checks.push({
    key: "public-database",
    label: "Public database connectivity",
    ready: publicDatabaseReady,
    detail: publicDatabaseReady
      ? "Public Supabase REST va asosiy backend jadvallari ishlayapti."
      : "Public Supabase REST yoki asosiy backend jadvallaridan kamida bittasi tayyor emas.",
  });

  const siteDocuments = supabaseRestReady && siteDocumentsTableReady
    ? await getLiveSiteDocumentOverview().catch((error) => ({
        available: false,
        source: "seed" as const,
        totalPublished: 0,
        byKind: {},
        detail: classifyError(error, "site_documents overview xatosi").detail,
      }))
    : {
        available: false,
        source: "seed" as const,
        totalPublished: 0,
        byKind: {},
        detail: "site_documents jadvali tayyor bo'lmagani uchun structured content tekshirilmadi.",
      };
  const structuredContentLive = siteDocuments.available && siteDocuments.totalPublished > 0;

  checks.push({
    key: "site-documents",
    label: "Structured content documents",
    ready: siteDocuments.available,
    detail: siteDocuments.detail,
  });

  checks.push({
    key: "site-documents-live",
    label: "Structured content live mode",
    ready: structuredContentLive,
    detail: structuredContentLive
      ? "Public catalog va site data database orqali xizmat qilmoqda."
      : "Structured content hali seed fallback rejimida ishlayapti.",
  });

  const { apiKey, model } = getAnthropicConfig();
  const aiConfigured = hasConfiguredAnthropicKey(apiKey);

  checks.push({
    key: "anthropic-env",
    label: "AI Mentor environment",
    ready: aiConfigured,
    detail: aiConfigured
      ? `Anthropic model tayyor: ${model}.`
      : "ANTHROPIC_API_KEY hali placeholder yoki bo'sh.",
  });

  const coreChecks = [
    supabaseEnvReady,
    supabaseAdminEnvReady,
    databaseConnectionEnvReady,
    publicDatabaseReady,
    profilesReady,
    siteContentReady,
    siteDocumentsTableReady,
    paymentIntentsReady,
  ];
  const status = coreChecks.every(Boolean) ? "ok" : "degraded";

  return {
    status,
    checks,
    services: {
      supabaseEnv: supabaseEnvReady,
      supabaseAdminEnv: supabaseAdminEnvReady,
      publicDatabase: publicDatabaseReady,
      profiles: profilesReady,
      siteContent: siteContentReady,
      siteDocuments: siteDocuments.available,
      structuredContentLive,
      paymentIntents: paymentIntentsReady,
      aiMentorConfigured: aiConfigured,
      databaseConnectionEnv: databaseConnectionEnvReady,
    },
    content: {
      source: siteDocuments.source,
      publishedDocuments: siteDocuments.totalPublished,
      byKind: siteDocuments.byKind,
    },
    model: aiConfigured ? model : null,
    checkedAt: new Date().toISOString(),
  };
}
