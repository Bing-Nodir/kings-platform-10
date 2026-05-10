import { getInstructorCourseSubmissions } from "@/lib/server/course-submissions";
import { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type DataClient = Pick<SupabaseServerClient, "from">;

export interface InstructorApplicationRecord {
  id: string;
  user_id: string;
  professional_title: string | null;
  organization_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  public_bio: string | null;
  photo_url: string | null;
  expertise: string | null;
  portfolio_url: string | null;
  payout_method: string | null;
  certificates: unknown[];
  certificate_template: Record<string, unknown>;
  statement: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  updated_at: string;
}

function sumAmounts(rows: Array<{ amount?: number | null }>) {
  return rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
}

function toMonthKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastSevenMonths() {
  const now = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (6 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  });
}

export async function getInstructorApplication(
  userId: string,
  supabase?: DataClient
): Promise<InstructorApplicationRecord | null> {
  const db = supabase ?? (await createClient());
  const { data } = await db
    .from("instructor_applications")
    .select(
      "id, user_id, professional_title, organization_name, contact_email, contact_phone, public_bio, photo_url, expertise, portfolio_url, payout_method, certificates, certificate_template, statement, status, admin_note, submitted_at, reviewed_at, updated_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

  return (data as InstructorApplicationRecord | null) ?? null;
}

export async function getInstructorWorkspaceData(
  instructorId: string,
  supabase?: DataClient
) {
  const db = supabase ?? (await createClient());
  const [{ data: profile }, submissions] = await Promise.all([
    db
      .from("profiles")
      .select("id, full_name, email, avatar_url, bio, company_name")
      .eq("id", instructorId)
      .maybeSingle(),
    getInstructorCourseSubmissions(instructorId, db),
  ]);

  const publishedSubmissions = submissions.filter(
    (submission) => submission.status === "published"
  );
  const courseIds = Array.from(
    new Set(
      publishedSubmissions
        .flatMap((submission) => [submission.slug, submission.payload.id])
        .filter(Boolean)
    )
  );

  const [
    coursesResult,
    enrollmentsResult,
    sessionsResult,
    ordersResult,
    questionsResult,
    assetsResult,
    payoutsResult,
  ] = await Promise.all([
    db
      .from("courses")
      .select("id, title, description, price, created_at")
      .eq("instructor_id", instructorId),
    courseIds.length
      ? db
          .from("enrollments")
          .select(
            "user_id, course_id, progress_percent, completed_at, enrolled_at, last_accessed_at"
          )
          .in("course_id", courseIds)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? db
          .from("learning_sessions")
          .select("user_id, course_id, lesson_id, duration_minutes, created_at")
          .in("course_id", courseIds)
          .order("created_at", { ascending: false })
          .limit(400)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? db
          .from("orders")
          .select("id, user_id, user_email, item_id, item_title, amount, status, created_at")
          .in("item_id", courseIds)
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? db
          .from("course_questions")
          .select(
            "id, course_id, lesson_id, student_id, question_text, answer_text, status, created_at, answered_at, updated_at"
          )
          .in("course_id", courseIds)
          .order("created_at", { ascending: false })
          .limit(80)
      : Promise.resolve({ data: [] }),
    db
      .from("course_assets")
      .select(
        "id, submission_id, course_id, module_id, lesson_id, title, asset_type, storage_bucket, storage_path, mime_type, size_bytes, status, analysis, created_at, updated_at"
      )
      .eq("instructor_id", instructorId)
      .order("updated_at", { ascending: false })
      .limit(80),
    db
      .from("instructor_payouts")
      .select(
        "id, period_start, period_end, gross_revenue, platform_fee, payout_amount, status, paid_at, created_at"
      )
      .eq("instructor_id", instructorId)
      .order("period_start", { ascending: false })
      .limit(18),
  ]);

  const courses = (coursesResult.data ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    price: number | null;
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
    lesson_id: string | null;
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
    created_at: string;
  }>;
  const questions = (questionsResult.data ?? []) as Array<{
    id: string;
    course_id: string;
    lesson_id: string | null;
    student_id: string;
    question_text: string;
    answer_text: string | null;
    status: string;
    created_at: string;
    answered_at: string | null;
    updated_at: string;
  }>;
  const assets = (assetsResult.data ?? []) as Array<{
    id: string;
    submission_id: string | null;
    course_id: string;
    module_id: string | null;
    lesson_id: string | null;
    title: string;
    asset_type: string;
    storage_bucket: string;
    storage_path: string;
    mime_type: string | null;
    size_bytes: number | null;
    status: string;
    analysis: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }>;
  const payouts = (payoutsResult.data ?? []) as Array<{
    id: string;
    period_start: string;
    period_end: string;
    gross_revenue: number | null;
    platform_fee: number | null;
    payout_amount: number | null;
    status: string;
    paid_at: string | null;
    created_at: string;
  }>;

  const studentIds = Array.from(new Set(enrollments.map((item) => item.user_id)));
  const questionStudentIds = Array.from(new Set(questions.map((item) => item.student_id)));
  const { data: studentProfiles } =
    studentIds.length || questionStudentIds.length
      ? await db
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", Array.from(new Set([...studentIds, ...questionStudentIds])))
      : { data: [] as Array<{ id: string; full_name: string | null; email: string | null; avatar_url: string | null }> };
  const profilesById = new Map(
    (studentProfiles ?? []).map((item) => [item.id, item])
  );

  const paidOrders = orders.filter((order) => order.status === "paid");
  const totalRevenue = sumAmounts(paidOrders);
  const estimatedPayout = Math.round(totalRevenue * 0.65);
  const activeStudentCount = studentIds.length;
  const completedCount = enrollments.filter((item) => item.completed_at).length;
  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (sum, item) => sum + (item.progress_percent ?? 0),
            0
          ) / enrollments.length
        )
      : 0;
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0
  );

  const months = getLastSevenMonths();
  const revenueByMonth = new Map(months.map((month) => [month.key, 0]));
  paidOrders.forEach((order) => {
    const key = toMonthKey(order.created_at);
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (order.amount ?? 0));
    }
  });
  const maxRevenue = Math.max(...revenueByMonth.values(), 1);
  const revenueSeries = months.map((month) => {
    const value = revenueByMonth.get(month.key) ?? 0;
    return {
      ...month,
      value,
      height: Math.max(8, Math.round((value / maxRevenue) * 100)),
    };
  });

  const enrollmentsByCourse = new Map<string, typeof enrollments>();
  const enrollmentsByStudent = new Map<string, typeof enrollments>();
  enrollments.forEach((enrollment) => {
    const courseRows = enrollmentsByCourse.get(enrollment.course_id) ?? [];
    courseRows.push(enrollment);
    enrollmentsByCourse.set(enrollment.course_id, courseRows);

    const studentRows = enrollmentsByStudent.get(enrollment.user_id) ?? [];
    studentRows.push(enrollment);
    enrollmentsByStudent.set(enrollment.user_id, studentRows);
  });
  const assetsByCourse = new Map<string, typeof assets>();
  assets.forEach((asset) => {
    const rows = assetsByCourse.get(asset.course_id) ?? [];
    rows.push(asset);
    assetsByCourse.set(asset.course_id, rows);
  });
  const ordersByCourse = new Map<string, typeof paidOrders>();
  paidOrders.forEach((order) => {
    if (!order.item_id) return;
    const rows = ordersByCourse.get(order.item_id) ?? [];
    rows.push(order);
    ordersByCourse.set(order.item_id, rows);
  });

  const courseCards = publishedSubmissions.map((submission) => {
    const courseEnrollments = enrollmentsByCourse.get(submission.slug) ?? [];
    const courseOrders = ordersByCourse.get(submission.slug) ?? [];
    const courseAssets = assetsByCourse.get(submission.slug) ?? [];
    const moduleCount = submission.payload.modules.length;
    const lessonCount = submission.payload.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );

    return {
      id: submission.slug,
      title: submission.title,
      category: submission.category ?? submission.payload.category,
      status: submission.status,
      price: submission.price,
      moduleCount,
      lessonCount,
      students: courseEnrollments.length,
      revenue: sumAmounts(courseOrders),
      assets: courseAssets.length,
      updatedAt: submission.updated_at,
    };
  });

  const recentQuestions = questions.slice(0, 8).map((question) => {
    const student = profilesById.get(question.student_id);
    return {
      ...question,
      studentName: student?.full_name ?? student?.email ?? "Student",
      studentEmail: student?.email ?? null,
      courseTitle:
        courseCards.find((course) => course.id === question.course_id)?.title ??
        courses.find((course) => course.id === question.course_id)?.title ??
        question.course_id,
    };
  });

  const sessionsByStudent = new Map<string, typeof sessions>();
  sessions.forEach((session) => {
    const rows = sessionsByStudent.get(session.user_id) ?? [];
    rows.push(session);
    sessionsByStudent.set(session.user_id, rows);
  });

  const courseTitleById = new Map<string, string>();
  courseCards.forEach((course) => {
    courseTitleById.set(course.id, course.title);
  });
  courses.forEach((course) => {
    courseTitleById.set(course.id, course.title);
  });

  const students = studentIds
    .map((studentId) => {
      const student = profilesById.get(studentId);
      const studentEnrollments = enrollmentsByStudent.get(studentId) ?? [];
      const studentSessions = sessionsByStudent.get(studentId) ?? [];
      const totalMinutes = studentSessions.reduce(
        (sum, session) => sum + (session.duration_minutes ?? 0),
        0
      );
      const lastAccessedAt =
        studentEnrollments
          .map((enrollment) => enrollment.last_accessed_at ?? enrollment.enrolled_at)
          .filter(Boolean)
          .sort((first, second) => second.localeCompare(first))[0] ?? null;
      const averageStudentProgress =
        studentEnrollments.length > 0
          ? Math.round(
              studentEnrollments.reduce(
                (sum, enrollment) => sum + (enrollment.progress_percent ?? 0),
                0
              ) / studentEnrollments.length
            )
          : 0;

      return {
        id: studentId,
        name: student?.full_name ?? student?.email ?? "Student",
        email: student?.email ?? null,
        avatarUrl: student?.avatar_url ?? null,
        enrolledCourses: studentEnrollments.length,
        completedCourses: studentEnrollments.filter(
          (enrollment) => enrollment.completed_at
        ).length,
        averageProgress: averageStudentProgress,
        totalLearningMinutes: totalMinutes,
        lastAccessedAt,
        courseTitles: studentEnrollments
          .map((enrollment) => courseTitleById.get(enrollment.course_id) ?? enrollment.course_id)
          .slice(0, 4),
      };
    })
    .sort((first, second) => {
      if (!first.lastAccessedAt && !second.lastAccessedAt) return 0;
      if (!first.lastAccessedAt) return 1;
      if (!second.lastAccessedAt) return -1;
      return second.lastAccessedAt.localeCompare(first.lastAccessedAt);
    });

  const learningActivity = sessions.slice(0, 12).map((session) => {
    const student = profilesById.get(session.user_id);
    return {
      ...session,
      studentName: student?.full_name ?? student?.email ?? "Student",
      courseTitle: courseTitleById.get(session.course_id) ?? session.course_id,
    };
  });

  return {
    profile: {
      id: instructorId,
      name:
        (profile as { full_name?: string | null } | null)?.full_name ??
        (profile as { email?: string | null } | null)?.email ??
        "Instructor",
      email: (profile as { email?: string | null } | null)?.email ?? null,
      avatarUrl: (profile as { avatar_url?: string | null } | null)?.avatar_url ?? null,
      bio: (profile as { bio?: string | null } | null)?.bio ?? null,
    },
    metrics: {
      totalStudents: activeStudentCount,
      totalRevenue,
      estimatedPayout,
      averageRating:
        courseCards.length > 0
          ? Math.round(
              (publishedSubmissions.reduce(
                (sum, submission) => sum + submission.payload.rating,
                0
              ) /
                publishedSubmissions.length) *
                10
            ) / 10
          : 0,
      publishedCourses: courseCards.length,
      draftCourses: submissions.filter((item) => item.status === "draft").length,
      reviewQueue: submissions.filter((item) => item.status === "submitted").length,
      openQuestions: questions.filter((item) => item.status === "open").length,
      uploadedAssets: assets.length,
      completedStudents: completedCount,
      averageProgress,
      totalLearningHours: Math.round(totalMinutes / 60),
    },
    revenueSeries,
    submissions,
    courseCards,
    recentQuestions,
    students,
    learningActivity,
    assets,
    payouts,
    orders: paidOrders.slice(0, 12),
  };
}
