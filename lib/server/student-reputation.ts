import { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type ReputationClient = Pick<SupabaseServerClient, "from">;

export interface StudentReputation {
  userId: string;
  creditScore: number;
  violationsCount: number;
  warningAcknowledgedAt: string | null;
  lastViolationAt: string | null;
  mutedUntil: string | null;
  pricingPenaltyPercent: number;
  backendReady: boolean;
}

export function isStudentReputationBackendMissing(error: {
  code?: string;
  message?: string;
} | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    message.includes("does not exist") ||
    message.includes("could not find")
  );
}

export function calculatePricingPenaltyPercent(creditScore: number) {
  if (creditScore >= 80) return 0;
  if (creditScore >= 60) return 5;
  if (creditScore >= 40) return 10;
  return 20;
}

export function applyPricingPenalty(amount: number, penaltyPercent: number) {
  if (penaltyPercent <= 0) {
    return amount;
  }

  return Math.round(amount * (1 + penaltyPercent / 100));
}

function defaultReputation(userId: string): StudentReputation {
  return {
    userId,
    creditScore: 100,
    violationsCount: 0,
    warningAcknowledgedAt: null,
    lastViolationAt: null,
    mutedUntil: null,
    pricingPenaltyPercent: 0,
    backendReady: false,
  };
}

function mapReputationRow(
  userId: string,
  row: {
    credit_score: number | null;
    violations_count: number | null;
    warning_acknowledged_at: string | null;
    last_violation_at: string | null;
    muted_until: string | null;
    pricing_penalty_percent: number | null;
  } | null
): StudentReputation {
  const creditScore = row?.credit_score ?? 100;

  return {
    userId,
    creditScore,
    violationsCount: row?.violations_count ?? 0,
    warningAcknowledgedAt: row?.warning_acknowledged_at ?? null,
    lastViolationAt: row?.last_violation_at ?? null,
    mutedUntil: row?.muted_until ?? null,
    pricingPenaltyPercent:
      row?.pricing_penalty_percent ?? calculatePricingPenaltyPercent(creditScore),
    backendReady: true,
  };
}

export async function getStudentReputation(
  userId: string,
  supabase?: ReputationClient
) {
  const db = supabase ?? (await createClient());

  const insertResult = await db
    .from("student_reputation")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });

  if (insertResult.error && isStudentReputationBackendMissing(insertResult.error)) {
    return defaultReputation(userId);
  }

  const { data, error } = await db
    .from("student_reputation")
    .select(
      "credit_score, violations_count, warning_acknowledged_at, last_violation_at, muted_until, pricing_penalty_percent"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isStudentReputationBackendMissing(error)) {
    return defaultReputation(userId);
  }

  return mapReputationRow(userId, data ?? null);
}

export async function acknowledgeDiscussionRules(
  userId: string,
  supabase?: ReputationClient
) {
  const db = supabase ?? (await createClient());

  await db
    .from("student_reputation")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });

  const acknowledgedAt = new Date().toISOString();
  const { error } = await db
    .from("student_reputation")
    .update({ warning_acknowledged_at: acknowledgedAt })
    .eq("user_id", userId);

  if (error && isStudentReputationBackendMissing(error)) {
    return defaultReputation(userId);
  }

  return getStudentReputation(userId, db);
}
