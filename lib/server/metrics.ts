import { courses } from "@/lib/catalog";
import { getAnthropicConfig, hasConfiguredAnthropicKey } from "@/lib/server/env";
import { createClient } from "@/utils/supabase/server";
import { getSupabasePublicConfig } from "@/utils/supabase/config";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type QueryResult<T> = { data: T | null; error?: { message?: string } | null };
type CountResult = { count: number | null; error?: { message?: string } | null };
type AwaitableQueryResult =
  | QueryResult<unknown>
  | CountResult
  | PromiseLike<QueryResult<unknown> | CountResult>;

export interface BackendStatusCheck {
  key: string;
  label: string;
  ready: boolean;
  detail: string;
}

async function getSupabase(supabase?: SupabaseServerClient) {
  return supabase ?? (await createClient());
}

function sumAmounts(rows: Array<{ amount: number | null }> | null | undefined) {
  return rows?.reduce((sum, row) => sum + (row.amount ?? 0), 0) ?? 0;
}

async function runQueryCheck(
  label: string,
  key: string,
  query: AwaitableQueryResult,
  successDetail: string
): Promise<BackendStatusCheck> {
  try {
    const result = await query;

    if (result?.error) {
      return {
        key,
        label,
        ready: false,
        detail: result.error.message ?? "Database query failed.",
      };
    }

    return {
      key,
      label,
      ready: true,
      detail: successDetail,
    };
  } catch (error) {
    return {
      key,
      label,
      ready: false,
      detail: error instanceof Error ? error.message : "Unknown backend error.",
    };
  }
}

export async function getAdminOverviewData(supabase?: SupabaseServerClient) {
  const db = await getSupabase(supabase);

  const [{ count: userCount }, { count: orderCount }, { data: revenueData }, { data: recentOrders }, { data: recentUsers }] =
    await Promise.all([
      db.from("profiles").select("*", { count: "exact", head: true }),
      db.from("orders").select("*", { count: "exact", head: true }),
      db.from("orders").select("amount").eq("status", "paid"),
      db.from("orders")
        .select("id, amount, status, created_at, user_email, item_title")
        .order("created_at", { ascending: false })
        .limit(5),
      db.from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    userCount: userCount ?? 0,
    orderCount: orderCount ?? 0,
    totalRevenue: sumAmounts(revenueData),
    recentOrders: recentOrders ?? [],
    recentUsers: recentUsers ?? [],
  };
}

export async function getAdminAnalyticsData(supabase?: SupabaseServerClient) {
  const db = await getSupabase(supabase);

  const [
    { data: enrollments },
    { data: sessions },
    { data: orders },
    { data: certificates },
    { data: quizAttempts },
    { data: profiles },
    { count: totalUsers },
  ] = await Promise.all([
    db.from("enrollments").select(
      "course_id, progress_percent, completed_at, enrolled_at"
    ),
    db.from("learning_sessions").select("duration_minutes, course_id, created_at"),
    db.from("orders").select("amount, status, created_at, item_id"),
    db.from("certificates").select("course_id, issued_at"),
    db.from("quiz_attempts")
      .select("course_id, score, total, percent, passed, completed_at")
      .order("completed_at", { ascending: false }),
    db.from("profiles")
      .select("id, created_at, role")
      .order("created_at", { ascending: false })
      .limit(30),
    db.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const paidOrders = orders?.filter((order) => order.status === "paid") ?? [];
  const totalRevenue = sumAmounts(paidOrders);
  const totalMinutes =
    sessions?.reduce((sum, session) => sum + (session.duration_minutes ?? 0), 0) ??
    0;
  const totalHours = Math.round(totalMinutes / 60);
  const completedCount = enrollments?.filter((item) => item.completed_at).length ?? 0;
  const totalEnrollments = enrollments?.length ?? 0;
  const completionRate =
    totalEnrollments > 0
      ? Math.round((completedCount / totalEnrollments) * 100)
      : 0;
  const totalQuizAttempts = quizAttempts?.length ?? 0;
  const passedAttempts = quizAttempts?.filter((attempt) => attempt.passed).length ?? 0;
  const quizPassRate =
    totalQuizAttempts > 0
      ? Math.round((passedAttempts / totalQuizAttempts) * 100)
      : 0;

  const courseEnrollMap: Record<string, number> = {};
  const courseRevenueMap: Record<string, number> = {};
  const courseCompletionMap: Record<string, number> = {};

  enrollments?.forEach((enrollment) => {
    courseEnrollMap[enrollment.course_id] =
      (courseEnrollMap[enrollment.course_id] ?? 0) + 1;
    if (enrollment.completed_at) {
      courseCompletionMap[enrollment.course_id] =
        (courseCompletionMap[enrollment.course_id] ?? 0) + 1;
    }
  });

  paidOrders.forEach((order) => {
    if (order.item_id) {
      courseRevenueMap[order.item_id] =
        (courseRevenueMap[order.item_id] ?? 0) + (order.amount ?? 0);
    }
  });

  const courseStats = courses
    .map((course) => ({
      id: course.id,
      title: course.title,
      enrollCount: courseEnrollMap[course.id] ?? 0,
      completedCount: courseCompletionMap[course.id] ?? 0,
      revenue: courseRevenueMap[course.id] ?? 0,
      completionRate:
        (courseEnrollMap[course.id] ?? 0) > 0
          ? Math.round(
              ((courseCompletionMap[course.id] ?? 0) /
                (courseEnrollMap[course.id] ?? 1)) *
                100
            )
          : 0,
    }))
    .sort((first, second) => second.enrollCount - first.enrollCount);

  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    return date.toDateString();
  });

  const usersByDay: Record<string, number> = {};
  profiles?.forEach((profile) => {
    const day = new Date(profile.created_at).toDateString();
    if (last7Days.includes(day)) {
      usersByDay[day] = (usersByDay[day] ?? 0) + 1;
    }
  });

  const quizByCourse: Record<
    string,
    { attempts: number; passed: number; avgScore: number }
  > = {};

  quizAttempts?.forEach((attempt) => {
    if (!quizByCourse[attempt.course_id]) {
      quizByCourse[attempt.course_id] = { attempts: 0, passed: 0, avgScore: 0 };
    }

    quizByCourse[attempt.course_id].attempts += 1;
    if (attempt.passed) {
      quizByCourse[attempt.course_id].passed += 1;
    }
    quizByCourse[attempt.course_id].avgScore += attempt.percent;
  });

  Object.keys(quizByCourse).forEach((key) => {
    quizByCourse[key].avgScore = Math.round(
      quizByCourse[key].avgScore / quizByCourse[key].attempts
    );
  });

  return {
    totalRevenue,
    totalHours,
    completionRate,
    quizPassRate,
    totalEnrollments,
    totalQuizAttempts,
    courseStats,
    last7Days,
    usersByDay,
    quizByCourse,
    totalUsers: totalUsers ?? 0,
    certCount: certificates?.length ?? 0,
  };
}

export async function getBackendStatusData(supabase?: SupabaseServerClient) {
  const db = await getSupabase(supabase);
  const checks: BackendStatusCheck[] = [];

  try {
    getSupabasePublicConfig();
    checks.push({
      key: "supabase-env",
      label: "Supabase environment",
      ready: true,
      detail: "Public URL va anon key konfiguratsiyasi topildi.",
    });
  } catch (error) {
    checks.push({
      key: "supabase-env",
      label: "Supabase environment",
      ready: false,
      detail:
        error instanceof Error ? error.message : "Supabase environment topilmadi.",
    });
  }

  const anthropic = getAnthropicConfig();
  checks.push({
    key: "anthropic-env",
    label: "AI Mentor environment",
    ready: hasConfiguredAnthropicKey(anthropic.apiKey),
    detail: hasConfiguredAnthropicKey(anthropic.apiKey)
      ? `Anthropic model tayyor: ${anthropic.model}.`
      : "ANTHROPIC_API_KEY hali placeholder yoki bo'sh.",
  });

  checks.push(
    await runQueryCheck(
      "Profiles table",
      "profiles-table",
      db.from("profiles").select("id", { count: "exact", head: true }),
      "Profiles jadvali va RLS query ishlayapti."
    )
  );
  checks.push(
    await runQueryCheck(
      "Orders metadata",
      "orders-metadata",
      db
        .from("orders")
        .select("id, payment_method, customer_name, customer_phone")
        .limit(1),
      "Checkout metadata ustunlari mavjud."
    )
  );
  checks.push(
    await runQueryCheck(
      "Profile settings fields",
      "profile-settings-fields",
      db
        .from("profiles")
        .select("id, phone, bio, company_name, language_pref")
        .limit(1),
      "Profile settings ustunlari mavjud."
    )
  );
  checks.push(
    await runQueryCheck(
      "Learning tables",
      "learning-tables",
      db.from("learning_sessions").select("id", { count: "exact", head: true }),
      "Learning progress jadvali tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "AI storage tables",
      "ai-storage-tables",
      db.from("ai_conversations").select("id", { count: "exact", head: true }),
      "AI conversation storage tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "User notes table",
      "user-notes-table",
      db.from("user_notes").select("id", { count: "exact", head: true }),
      "User notes backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Quiz attempts table",
      "quiz-attempts-table",
      db.from("quiz_attempts").select("id", { count: "exact", head: true }),
      "Quiz attempts backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Wishlist table",
      "wishlist-table",
      db.from("wishlist_courses").select("id", { count: "exact", head: true }),
      "Saved courses backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Contact inbox",
      "contact-inbox",
      db
        .from("contact_messages")
        .select("id", { count: "exact", head: true }),
      "Contact inbox query ishlayapti."
    )
  );

  const [
    { count: totalUsers },
    { count: totalOrders },
    { count: totalMessages },
    { count: totalEnrollments },
    { count: totalWishlistItems },
  ] =
    await Promise.all([
      db.from("profiles").select("*", { count: "exact", head: true }),
      db.from("orders").select("*", { count: "exact", head: true }),
      db.from("contact_messages").select("*", { count: "exact", head: true }),
      db.from("enrollments").select("*", { count: "exact", head: true }),
      db.from("wishlist_courses").select("*", { count: "exact", head: true }),
    ]);

  const readyCount = checks.filter((check) => check.ready).length;

  return {
    checks,
    readyCount,
    totalChecks: checks.length,
    summary: {
      totalUsers: totalUsers ?? 0,
      totalOrders: totalOrders ?? 0,
      totalMessages: totalMessages ?? 0,
      totalEnrollments: totalEnrollments ?? 0,
      totalWishlistItems: totalWishlistItems ?? 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
