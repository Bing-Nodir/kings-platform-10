import { getCoursesData } from "@/lib/content-store";
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
        .select("id, amount, status, created_at, user_email, item_title, payment_method, payment_reference")
        .order("created_at", { ascending: false })
        .limit(5),
      db.from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const pendingOrderCount =
    (await db.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"))
      .count ?? 0;

  return {
    userCount: userCount ?? 0,
    orderCount: orderCount ?? 0,
    pendingOrderCount,
    totalRevenue: sumAmounts(revenueData),
    recentOrders: recentOrders ?? [],
    recentUsers: recentUsers ?? [],
  };
}

export async function getAdminControlCenterData(supabase?: SupabaseServerClient) {
  const db = await getSupabase(supabase);
  const courses = await getCoursesData();

  const [
    profilesResult,
    enrollmentsResult,
    sessionsResult,
    ordersResult,
    quizAttemptsResult,
    paymentIntentsResult,
    submissionsResult,
    instructorApplicationsResult,
    status,
  ] = await Promise.all([
    db
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(80),
    db
      .from("enrollments")
      .select("user_id, course_id, progress_percent, completed_at, enrolled_at, last_accessed_at"),
    db
      .from("learning_sessions")
      .select("user_id, course_id, duration_minutes, created_at")
      .order("created_at", { ascending: false })
      .limit(400),
    db
      .from("orders")
      .select("id, user_id, user_email, item_id, item_title, amount, status, payment_method, created_at")
      .order("created_at", { ascending: false })
      .limit(300),
    db
      .from("quiz_attempts")
      .select("user_id, course_id, percent, passed, completed_at")
      .order("completed_at", { ascending: false })
      .limit(300),
    db
      .from("payment_intents")
      .select("id, order_id, user_id, amount, status, provider, status_detail, created_at")
      .order("created_at", { ascending: false })
      .limit(80),
    db
      .from("course_submissions")
      .select("id, instructor_id, slug, title, category, status, submitted_at, updated_at, payload")
      .order("updated_at", { ascending: false })
      .limit(80),
    db
      .from("instructor_applications")
      .select(
        "id, user_id, professional_title, expertise, status, submitted_at, updated_at, statement"
      )
      .order("submitted_at", { ascending: false })
      .limit(40),
    getBackendStatusData(supabase),
  ]);

  const profiles = (profilesResult.data ?? []) as Array<{
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    created_at: string;
  }>;
  const enrollments = (enrollmentsResult.data ?? []) as Array<{
    user_id: string;
    course_id: string;
    progress_percent: number | null;
    completed_at: string | null;
    enrolled_at: string;
    last_accessed_at: string | null;
  }>;
  const sessions = (sessionsResult.data ?? []) as Array<{
    user_id: string;
    course_id: string;
    duration_minutes: number | null;
    created_at: string;
  }>;
  const orders = (ordersResult.data ?? []) as Array<{
    id: string;
    user_id: string | null;
    user_email: string | null;
    item_id: string | null;
    item_title: string | null;
    amount: number | null;
    status: string | null;
    payment_method: string | null;
    created_at: string;
  }>;
  const quizAttempts = (quizAttemptsResult.data ?? []) as Array<{
    user_id: string;
    course_id: string;
    percent: number | null;
    passed: boolean | null;
    completed_at: string;
  }>;
  const paymentIntents = (paymentIntentsResult.data ?? []) as Array<{
    id: string;
    order_id: string | null;
    user_id: string | null;
    amount: number | null;
    status: string | null;
    provider: string | null;
    status_detail: string | null;
    created_at: string;
  }>;
  const submissions = (submissionsResult.data ?? []) as Array<{
    id: string;
    instructor_id: string;
    slug: string;
    title: string;
    category: string | null;
    status: string;
    submitted_at: string | null;
    updated_at: string;
    payload: unknown;
  }>;
  const instructorApplications = (instructorApplicationsResult.data ?? []) as Array<{
    id: string;
    user_id: string;
    professional_title: string | null;
    expertise: string | null;
    status: string;
    submitted_at: string | null;
    updated_at: string;
    statement: string | null;
  }>;

  const paidOrders = orders.filter((order) => order.status === "paid");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const failedPaymentIntents = paymentIntents.filter((intent) =>
    ["failed", "cancelled"].includes(intent.status ?? "")
  );
  const totalRevenue = sumAmounts(paidOrders);
  const pendingBalance = sumAmounts(pendingOrders);
  const activeStudentIds = new Set(enrollments.map((item) => item.user_id));
  const totalInstructors = profiles.filter(
    (profile) => profile.role === "instructor"
  ).length;
  const pendingApplications = submissions.filter(
    (submission) => submission.status === "submitted"
  );
  const pendingInstructorApplications = instructorApplications.filter(
    (application) => application.status === "pending"
  );
  const systemHealthScore =
    status.totalChecks > 0
      ? Math.round((status.readyCount / status.totalChecks) * 100)
      : 0;

  const now = new Date();
  const months = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (6 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  });
  const revenueByMonth = new Map(months.map((month) => [month.key, 0]));
  paidOrders.forEach((order) => {
    const date = new Date(order.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (order.amount ?? 0));
    }
  });
  const maxMonthlyRevenue = Math.max(...revenueByMonth.values(), 1);
  const financialSeries = months.map((month) => {
    const value = revenueByMonth.get(month.key) ?? 0;
    return {
      ...month,
      value,
      height: Math.max(8, Math.round((value / maxMonthlyRevenue) * 100)),
    };
  });

  const sessionsByUser = new Map<string, typeof sessions>();
  sessions.forEach((session) => {
    const rows = sessionsByUser.get(session.user_id) ?? [];
    rows.push(session);
    sessionsByUser.set(session.user_id, rows);
  });
  const enrollmentsByUser = new Map<string, typeof enrollments>();
  enrollments.forEach((enrollment) => {
    const rows = enrollmentsByUser.get(enrollment.user_id) ?? [];
    rows.push(enrollment);
    enrollmentsByUser.set(enrollment.user_id, rows);
  });
  const quizByUser = new Map<string, typeof quizAttempts>();
  quizAttempts.forEach((attempt) => {
    const rows = quizByUser.get(attempt.user_id) ?? [];
    rows.push(attempt);
    quizByUser.set(attempt.user_id, rows);
  });

  const recentUsers = profiles.slice(0, 5).map((profile) => {
    const userEnrollments = enrollmentsByUser.get(profile.id) ?? [];
    const userSessions = sessionsByUser.get(profile.id) ?? [];
    const userQuizzes = quizByUser.get(profile.id) ?? [];
    const averageProgress =
      userEnrollments.length > 0
        ? Math.round(
            userEnrollments.reduce(
              (sum, item) => sum + (item.progress_percent ?? 0),
              0
            ) / userEnrollments.length
          )
        : 0;
    const quizAverage =
      userQuizzes.length > 0
        ? Math.round(
            userQuizzes.reduce((sum, item) => sum + (item.percent ?? 0), 0) /
              userQuizzes.length
          )
        : 0;
    const activity = Math.max(averageProgress, quizAverage);
    const minutes = userSessions.reduce(
      (sum, session) => sum + (session.duration_minutes ?? 0),
      0
    );

    return {
      id: profile.id,
      name: profile.full_name || profile.email || "No name",
      email: profile.email,
      role: profile.role ?? "student",
      joinedAt: profile.created_at,
      status: activity > 0 || userEnrollments.length > 0 ? "active" : "pending",
      activity,
      courses: userEnrollments.length,
      minutes,
    };
  });

  const courseEnrollMap = new Map<string, number>();
  enrollments.forEach((enrollment) => {
    courseEnrollMap.set(
      enrollment.course_id,
      (courseEnrollMap.get(enrollment.course_id) ?? 0) + 1
    );
  });
  const topCourses = courses
    .map((course) => ({
      id: course.id,
      title: course.title,
      enrollments: courseEnrollMap.get(course.id) ?? 0,
      rating: course.rating,
    }))
    .sort((first, second) => second.enrollments - first.enrollments)
    .slice(0, 4);

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const instructorApplicationCards = [
    ...pendingInstructorApplications.slice(0, 3).map((application) => {
      const profile = profilesById.get(application.user_id);

      return {
        id: application.id,
        name: profile?.full_name || profile?.email || "Instructor applicant",
        email: profile?.email ?? null,
        title: application.professional_title ?? "Instructor application",
        category: application.expertise ?? "Instructor role",
        description: application.statement ?? "",
        submittedAt: application.submitted_at ?? application.updated_at,
      };
    }),
    ...pendingApplications.slice(0, 3).map((submission) => {
    const profile = profilesById.get(submission.instructor_id);
    const payload = submission.payload as { description?: string } | null;

    return {
      id: submission.id,
      name: profile?.full_name || profile?.email || "Instructor",
      email: profile?.email ?? null,
      title: submission.title,
      category: submission.category ?? "Course",
      description: payload?.description ?? "",
      submittedAt: submission.submitted_at ?? submission.updated_at,
    };
    }),
  ].slice(0, 3);

  const alerts = [
    ...failedPaymentIntents.slice(0, 2).map((intent) => ({
      key: `payment-intent-${intent.id}`,
      tone: "critical" as const,
      title: "Payment intent xatosi",
      detail:
        intent.status_detail ||
        `${intent.provider ?? "provider"} statusi: ${intent.status ?? "unknown"}`,
      action: "Fix",
    })),
    ...pendingOrders.slice(0, 2).map((order) => ({
      key: `order-${order.id}`,
      tone: "warning" as const,
      title: "To'lov tasdiq kutilmoqda",
      detail: `${order.user_email ?? "user"} - ${order.item_title ?? "order"}`,
      action: "Detail",
    })),
    ...status.checks
      .filter((check) => !check.ready)
      .slice(0, 2)
      .map((check) => ({
        key: `check-${check.key}`,
        tone: "system" as const,
        title: check.label,
        detail: check.detail,
        action: "Detail",
      })),
  ].slice(0, 5);

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalRevenue,
      activeStudents: activeStudentIds.size,
      totalInstructors,
      systemHealthScore,
      pendingApplications:
        pendingApplications.length + pendingInstructorApplications.length,
      activePaymentIssues: failedPaymentIntents.length,
      courseCount: courses.length,
      pendingBalance,
    },
    financialSeries,
    paymentRatio: {
      studentPayments: totalRevenue,
      instructorPayouts: Math.round(totalRevenue * 0.35),
      pendingBalance,
    },
    recentUsers,
    topCourses,
    instructorApplications: instructorApplicationCards,
    alerts,
    backendStatus: status,
  };
}

export async function getAdminAnalyticsData(supabase?: SupabaseServerClient) {
  const db = await getSupabase(supabase);
  const courses = await getCoursesData();

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
      "Site content table",
      "site-content-table",
      db.from("site_content").select("content_key", { count: "exact", head: true }),
      "Editable site content backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Structured site documents",
      "site-documents-table",
      db.from("site_documents").select("id", { count: "exact", head: true }),
      "Structured content document store tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Courses catalog table",
      "courses-table",
      db.from("courses").select("id", { count: "exact", head: true }),
      "Public course catalog mirror jadvali tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Products catalog table",
      "products-table",
      db.from("products").select("id", { count: "exact", head: true }),
      "Edu shop product catalog jadvali tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Payment intents table",
      "payment-intents-table",
      db.from("payment_intents").select("id", { count: "exact", head: true }),
      "Payment lifecycle orchestration backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "User preferences table",
      "user-preferences-table",
      db.from("user_preferences").select("user_id", { count: "exact", head: true }),
      "Settings preference storage tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Security audit logs",
      "security-audit-logs-table",
      db
        .from("security_audit_logs")
        .select("id", { count: "exact", head: true }),
      "Security audit trail tayyor."
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
  checks.push(
    await runQueryCheck(
      "Notification queue",
      "notification-jobs-table",
      db.from("notification_jobs").select("id", { count: "exact", head: true }),
      "Transactional notification queue tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Operational event log",
      "operational-events-table",
      db.from("operational_events").select("id", { count: "exact", head: true }),
      "Operational event log tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Course submissions table",
      "course-submissions-table",
      db.from("course_submissions").select("id", { count: "exact", head: true }),
      "Instructor editorial workflow tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Instructor applications table",
      "instructor-applications-table",
      db
        .from("instructor_applications")
        .select("id", { count: "exact", head: true }),
      "Instructor approval workflow tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Course assets table",
      "course-assets-table",
      db.from("course_assets").select("id", { count: "exact", head: true }),
      "Instructor media asset backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Course questions table",
      "course-questions-table",
      db.from("course_questions").select("id", { count: "exact", head: true }),
      "Student Q&A backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Student reputation table",
      "student-reputation-table",
      db.from("student_reputation").select("user_id", { count: "exact", head: true }),
      "Student credit score va moderation backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Student credit event ledger",
      "student-credit-events-table",
      db.from("student_credit_events").select("id", { count: "exact", head: true }),
      "Credit score audit ledger tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Course discussion messages",
      "course-discussions-table",
      db.from("course_discussion_messages").select("id", { count: "exact", head: true }),
      "Enrolled student discussion backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Certificates table",
      "certificates-table",
      db.from("certificates").select("id", { count: "exact", head: true }),
      "Student certificate issuing backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Certificate templates table",
      "certificate-templates-table",
      db
        .from("certificate_templates")
        .select("id", { count: "exact", head: true }),
      "Instructor certificate template backend tayyor."
    )
  );
  checks.push(
    await runQueryCheck(
      "Instructor payouts table",
      "instructor-payouts-table",
      db.from("instructor_payouts").select("id", { count: "exact", head: true }),
      "Instructor financial payout backend tayyor."
    )
  );

  const [
    { count: totalUsers },
    { count: totalOrders },
    { count: totalMessages },
    { count: totalEnrollments },
    { count: totalWishlistItems },
    { count: totalPreferenceProfiles },
    { count: totalSecurityEvents },
    { count: totalPaymentIntents },
    { count: totalNotificationJobs },
    { count: queuedNotificationJobs },
    { count: failedNotificationJobs },
    { count: totalOperationalEvents },
    { count: totalCourseSubmissions },
    { count: pendingCourseReviews },
    { count: totalInstructorApplications },
    { count: pendingInstructorApplications },
    { count: totalCourseAssets },
    { count: openCourseQuestions },
    { count: totalStudentReputations },
    { count: mutedStudents },
    { count: lowCreditStudents },
    { count: totalCreditEvents },
    { count: totalDiscussionMessages },
    { count: blockedDiscussionMessages },
    { count: totalCoursesMirror },
    { count: totalProducts },
    { count: totalCertificates },
    { count: totalCertificateTemplates },
    { count: totalInstructorPayouts },
  ] =
    await Promise.all([
      db.from("profiles").select("*", { count: "exact", head: true }),
      db.from("orders").select("*", { count: "exact", head: true }),
      db.from("contact_messages").select("*", { count: "exact", head: true }),
      db.from("enrollments").select("*", { count: "exact", head: true }),
      db.from("wishlist_courses").select("*", { count: "exact", head: true }),
      db.from("user_preferences").select("*", { count: "exact", head: true }),
      db.from("security_audit_logs").select("*", { count: "exact", head: true }),
      db.from("payment_intents").select("*", { count: "exact", head: true }),
      db.from("notification_jobs").select("*", { count: "exact", head: true }),
      db
        .from("notification_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "queued"),
      db
        .from("notification_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed"),
      db.from("operational_events").select("*", { count: "exact", head: true }),
      db.from("course_submissions").select("*", { count: "exact", head: true }),
      db
        .from("course_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted"),
      db
        .from("instructor_applications")
        .select("*", { count: "exact", head: true }),
      db
        .from("instructor_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      db.from("course_assets").select("*", { count: "exact", head: true }),
      db
        .from("course_questions")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      db.from("student_reputation").select("*", { count: "exact", head: true }),
      db
        .from("student_reputation")
        .select("*", { count: "exact", head: true })
        .gt("muted_until", new Date().toISOString()),
      db
        .from("student_reputation")
        .select("*", { count: "exact", head: true })
        .lt("credit_score", 80),
      db.from("student_credit_events").select("*", { count: "exact", head: true }),
      db
        .from("course_discussion_messages")
        .select("*", { count: "exact", head: true }),
      db
        .from("course_discussion_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "blocked"),
      db.from("courses").select("*", { count: "exact", head: true }),
      db.from("products").select("*", { count: "exact", head: true }),
      db.from("certificates").select("*", { count: "exact", head: true }),
      db
        .from("certificate_templates")
        .select("*", { count: "exact", head: true }),
      db.from("instructor_payouts").select("*", { count: "exact", head: true }),
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
      totalPreferenceProfiles: totalPreferenceProfiles ?? 0,
      totalSecurityEvents: totalSecurityEvents ?? 0,
      totalPaymentIntents: totalPaymentIntents ?? 0,
      totalNotificationJobs: totalNotificationJobs ?? 0,
      queuedNotificationJobs: queuedNotificationJobs ?? 0,
      failedNotificationJobs: failedNotificationJobs ?? 0,
      totalOperationalEvents: totalOperationalEvents ?? 0,
      totalCourseSubmissions: totalCourseSubmissions ?? 0,
      pendingCourseReviews: pendingCourseReviews ?? 0,
      totalInstructorApplications: totalInstructorApplications ?? 0,
      pendingInstructorApplications: pendingInstructorApplications ?? 0,
      totalCourseAssets: totalCourseAssets ?? 0,
      openCourseQuestions: openCourseQuestions ?? 0,
      totalStudentReputations: totalStudentReputations ?? 0,
      mutedStudents: mutedStudents ?? 0,
      lowCreditStudents: lowCreditStudents ?? 0,
      totalCreditEvents: totalCreditEvents ?? 0,
      totalDiscussionMessages: totalDiscussionMessages ?? 0,
      blockedDiscussionMessages: blockedDiscussionMessages ?? 0,
      totalCoursesMirror: totalCoursesMirror ?? 0,
      totalProducts: totalProducts ?? 0,
      totalCertificates: totalCertificates ?? 0,
      totalCertificateTemplates: totalCertificateTemplates ?? 0,
      totalInstructorPayouts: totalInstructorPayouts ?? 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
