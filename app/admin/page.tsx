import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CreditCard,
  Database,
  GraduationCap,
  HeartPulse,
  MessageSquare,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import AdminLivePulse from "./AdminLivePulse";
import { getAdminControlCenterData } from "@/lib/server/metrics";

function formatMoney(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return value.toLocaleString();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

const alertStyles = {
  critical: {
    icon: ShieldAlert,
    tile: "bg-red-100 text-red-700",
    button: "bg-red-700 text-white hover:bg-red-800",
  },
  warning: {
    icon: AlertTriangle,
    tile: "bg-amber-100 text-amber-700",
    button: "bg-amber-800 text-white hover:bg-amber-900",
  },
  system: {
    icon: HeartPulse,
    tile: "bg-emerald-100 text-emerald-800",
    button: "bg-slate-900 text-white hover:bg-black",
  },
} as const;

export default async function AdminDashboard() {
  const data = await getAdminControlCenterData();
  const checksByKey = new Map(
    data.backendStatus.checks.map((check) => [check.key, check])
  );
  const getModuleStatus = (keys: string[]) => {
    const missing = keys
      .map((key) => checksByKey.get(key))
      .filter((check) => !check?.ready);

    return {
      ready: missing.length === 0,
      missing,
    };
  };
  const maxPayment = Math.max(
    data.paymentRatio.studentPayments,
    data.paymentRatio.instructorPayouts,
    data.paymentRatio.pendingBalance,
    1
  );
  const statCards = [
    {
      label: "Total revenue",
      value: `${formatMoney(data.metrics.totalRevenue)} so'm`,
      delta: "+ live",
      icon: CreditCard,
      tint: "bg-emerald-100 text-emerald-900",
      href: "/admin/orders",
    },
    {
      label: "Active students",
      value: data.metrics.activeStudents.toLocaleString(),
      delta: `${data.metrics.courseCount} courses`,
      icon: Users,
      tint: "bg-sky-100 text-sky-900",
      href: "/admin/users",
    },
    {
      label: "Total instructors",
      value: data.metrics.totalInstructors.toLocaleString(),
      delta: `${data.metrics.pendingApplications} pending`,
      icon: GraduationCap,
      tint: "bg-orange-100 text-orange-900",
      href: "/admin/reviews",
    },
    {
      label: "System health",
      value: `${data.metrics.systemHealthScore}%`,
      delta:
        data.metrics.activePaymentIssues > 0
          ? `${data.metrics.activePaymentIssues} payment issues`
          : "Stable",
      icon: Activity,
      tint:
        data.metrics.systemHealthScore >= 80
          ? "bg-emerald-100 text-emerald-900"
          : "bg-red-100 text-red-800",
      href: "/admin/settings",
    },
  ];
  const controlModules = [
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
      metric: `${data.backendStatus.summary.totalUsers.toLocaleString("uz-UZ")} profiles`,
      controls: "Role, email, course enrollment visibility",
      keys: ["profiles-table", "profile-settings-fields"],
    },
    {
      label: "Financials",
      href: "/admin/orders",
      icon: ShoppingBag,
      metric: `${formatMoney(data.metrics.totalRevenue)} so'm revenue`,
      controls: "Orders, payment status, payment intents",
      keys: ["orders-metadata", "payment-intents-table"],
    },
    {
      label: "Instructors",
      href: "/admin/reviews",
      icon: GraduationCap,
      metric: `${data.metrics.pendingApplications} pending`,
      controls: "Applications, course submissions, assets, payouts",
      keys: [
        "instructor-applications-table",
        "course-submissions-table",
        "course-assets-table",
        "instructor-payouts-table",
      ],
    },
    {
      label: "Content",
      href: "/admin/courses",
      icon: BookOpen,
      metric: `${data.metrics.courseCount} courses`,
      controls: "Course edit, archive, public catalog sync",
      keys: ["site-documents-table", "courses-table", "products-table"],
    },
    {
      label: "Support",
      href: "/admin/messages",
      icon: MessageSquare,
      metric: `${data.backendStatus.summary.totalMessages.toLocaleString("uz-UZ")} messages`,
      controls: "Inbox status, support categories, user email queue",
      keys: ["contact-inbox", "notification-jobs-table"],
    },
    {
      label: "System Overview",
      href: "/admin",
      icon: Activity,
      metric: `${data.metrics.systemHealthScore}% health`,
      controls: "Live overview, alerts, system pulse",
      keys: ["supabase-env", "site-documents-table", "payment-intents-table"],
    },
    {
      label: "Learning Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      metric: `${data.backendStatus.summary.totalEnrollments.toLocaleString("uz-UZ")} enrollments`,
      controls: "Learning time, quiz, completion, certificates",
      keys: ["learning-tables", "quiz-attempts-table", "certificates-table"],
    },
    {
      label: "Content Store",
      href: "/admin/content",
      icon: Database,
      metric: `${data.backendStatus.summary.totalProducts.toLocaleString("uz-UZ")} products`,
      controls: "Site copy, structured documents, products",
      keys: ["site-content-table", "site-documents-table", "products-table"],
    },
    {
      label: "Operations",
      href: "/admin/operations",
      icon: Bell,
      metric: `${data.backendStatus.summary.queuedNotificationJobs} queued`,
      controls: "Notification jobs, event log, security events",
      keys: [
        "notification-jobs-table",
        "operational-events-table",
        "security-audit-logs-table",
      ],
    },
    {
      label: "System Health",
      href: "/admin/settings",
      icon: Settings,
      metric: `${data.backendStatus.readyCount}/${data.backendStatus.totalChecks} ready`,
      controls: "Migration readiness, env, backend checks",
      keys: data.backendStatus.checks.map((check) => check.key),
    },
  ];

  return (
    <div className="space-y-10">
      <AdminLivePulse
        initialSnapshot={{
          generatedAt: data.generatedAt,
          metrics: data.metrics,
          backendStatus: {
            readyCount: data.backendStatus.readyCount,
            totalChecks: data.backendStatus.totalChecks,
          },
        }}
      />

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Admin control matrix
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Saytning barcha boshqaruv modullari
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Har bir bo'lim real Supabase jadval, action va live monitoring
              statusiga ulangan.
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-emerald-900 hover:text-emerald-950"
          >
            <ShieldCheck className="h-4 w-4" />
            Full backend audit
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {controlModules.map((module) => {
            const status = getModuleStatus(module.keys);
            const Icon = module.icon;

            return (
              <Link
                key={module.label}
                href={module.href}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-900 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-950 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                      status.ready
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {status.ready ? "Ready" : `${status.missing.length} issue`}
                  </span>
                </div>
                <h2 className="mt-4 font-black text-slate-950">
                  {module.label}
                </h2>
                <p className="mt-1 text-sm font-bold text-emerald-900">
                  {module.metric}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                  {module.controls}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm shadow-slate-200/70 transition hover:border-emerald-900 hover:shadow-md"
          >
            <div className="mb-5 flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded ${card.tint}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                {card.delta}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {card.value}
            </p>
            <div className="mt-5 h-1 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-950 transition-all group-hover:bg-emerald-700"
                style={{
                  width:
                    card.label === "System health"
                      ? `${clampPercent(data.metrics.systemHealthScore)}%`
                      : "72%",
                }}
              />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Financial Analysis
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Revenue trends from paid orders
              </p>
            </div>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <span className="rounded-md px-4 py-2 text-xs font-bold text-slate-600">
                Weekly
              </span>
              <span className="rounded-md bg-emerald-950 px-4 py-2 text-xs font-bold text-white">
                Monthly
              </span>
            </div>
          </div>

          <div className="flex h-64 items-end gap-5">
            {data.financialSeries.map((month, index) => (
              <div key={month.key} className="flex h-full flex-1 flex-col justify-end gap-4">
                <div
                  className={`rounded-t-md ${
                    index === data.financialSeries.length - 1
                      ? "bg-emerald-300"
                      : index === 3
                        ? "bg-slate-300"
                        : "bg-slate-200"
                  }`}
                  style={{ height: `${month.height}%` }}
                  title={`${month.label}: ${formatMoney(month.value)} so'm`}
                />
                <span className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Payment Ratio
          </h2>
          <p className="mt-1 text-sm text-slate-600">Student revenue and payout view</p>

          <div className="mt-14 space-y-8">
            {[
              {
                label: "Student Payments",
                value: data.paymentRatio.studentPayments,
                color: "bg-emerald-950",
              },
              {
                label: "Instructor Payouts",
                value: data.paymentRatio.instructorPayouts,
                color: "bg-amber-800",
              },
              {
                label: "Pending Balance",
                value: data.paymentRatio.pendingBalance,
                color: "bg-slate-500",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex justify-between gap-4 text-sm font-bold text-slate-950">
                  <span>{row.label}</span>
                  <span>{formatMoney(row.value)} so'm</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{
                      width: `${Math.max(4, Math.round((row.value / maxPayment) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4 border-t border-slate-200 pt-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-slate-950">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700">Net Margin</p>
              <p className="text-2xl font-black text-slate-950">+65.0%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-700" />
              <h2 className="text-xl font-black text-slate-950">
                System Alerts & Monitoring
              </h2>
            </div>
            <Link
              href="/admin/operations"
              className="text-sm font-bold text-slate-700 hover:text-emerald-900"
            >
              View History
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {data.alerts.length === 0 ? (
              <div className="flex items-center gap-3 px-8 py-8 text-sm text-slate-600">
                <Check className="h-5 w-5 text-emerald-700" />
                Critical alert yo'q
              </div>
            ) : (
              data.alerts.map((alert) => {
                const style = alertStyles[alert.tone];
                const Icon = style.icon;

                return (
                  <div
                    key={alert.key}
                    className="flex flex-col gap-4 px-8 py-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${style.tile}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-950">{alert.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {alert.detail}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href="/admin/settings"
                        className={`rounded px-4 py-2 text-xs font-bold ${style.button}`}
                      >
                        {alert.action}
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="rounded bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">
              Instructor Applications
            </h2>
            <Link
              href="/admin/reviews"
              className="text-sm font-bold text-emerald-900 hover:text-emerald-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-5">
            {data.instructorApplications.length === 0 ? (
              <div className="rounded-[1.25rem] border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600 shadow-sm">
                Review queue bo'sh
              </div>
            ) : (
              data.instructorApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">
                      {application.name[0]?.toUpperCase() ?? "I"}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950">{application.name}</h3>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        {application.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm italic leading-6 text-slate-600">
                    &quot;{application.title}&quot;
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href="/admin/reviews"
                      className="rounded bg-emerald-950 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-800"
                    >
                      Approve
                    </Link>
                    <Link
                      href="/admin/reviews"
                      className="rounded bg-slate-100 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-slate-600 hover:bg-slate-200"
                    >
                      Review
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-8 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Recent User Growth
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Real-time registration and learning activity stream
            </p>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            <Users className="h-4 w-4" />
            All Roles
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Join Date</th>
                <th className="px-8 py-4">Activity</th>
                <th className="px-8 py-4 text-right">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-900">
                        {user.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("") || "U"}
                      </span>
                      <span>
                        <span className="block font-black text-slate-950">
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-medium capitalize text-slate-950">
                    {user.role}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                        user.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-600">
                    {formatDate(user.joinedAt)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-950"
                        style={{ width: `${Math.max(3, clampPercent(user.activity))}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-950">
                    {user.courses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {data.topCourses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:border-emerald-900 hover:shadow-md"
          >
            <BookOpen className="h-5 w-5 text-emerald-900" />
            <p className="mt-4 line-clamp-2 font-black text-slate-950">
              {course.title}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{course.enrollments} enrollments</span>
              <span className="inline-flex items-center gap-1 font-black text-slate-950">
                <ArrowUpRight className="h-4 w-4" />
                {course.rating}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
