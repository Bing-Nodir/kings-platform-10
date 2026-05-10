import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Settings,
  UploadCloud,
  Users,
  WalletCards,
} from "lucide-react";
import InstructorLivePulse from "./InstructorLivePulse";
import { submitInstructorApplication } from "./actions";
import {
  isInstructorUser,
  requireAuthenticatedPage,
} from "@/lib/server/auth";
import {
  getInstructorApplication,
  getInstructorWorkspaceData,
} from "@/lib/server/instructor-workspace";

type InstructorPageProps = {
  searchParams: Promise<{ application_status?: string }>;
};

function formatMoney(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString("uz-UZ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });
}

const applicationMessages: Record<string, string> = {
  submitted: "Ariza admin review queue'ga yuborildi.",
  "needs-statement": "Statement kamida 40 ta belgidan iborat bo'lishi kerak.",
  "missing-backend": "instructor_applications jadvali yo'q. Migrationni Supabase'da ishga tushiring.",
  failed: "Ariza saqlanmadi. Supabase RLS yoki ulanishni tekshiring.",
};

function InstructorApplicationGate({
  application,
  status,
}: {
  application: Awaited<ReturnType<typeof getInstructorApplication>>;
  status?: string;
}) {
  const message = status ? applicationMessages[status] : null;
  const statusLabel = application?.status ?? "not_submitted";

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-6 py-12 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-800">
              <GraduationCap className="h-4 w-4" />
              Instructor Mode
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950">
              Instructor panel ochilishi uchun admin tasdiq kerak
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Ariza yuborasiz, admin profilingizni ko'rib chiqadi. Tasdiqlangandan
              keyin kurs yaratish, video yuklash, student savollariga javob berish
              va financial bo'lim avtomatik ochiladi.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Kurs draft va curriculum yaratish",
                "Video/media upload va asset metadata",
                "Student progress, savollar va analytics",
                "Revenue, payout va order tracking",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Joriy holat
              </p>
              <p className="mt-2 text-2xl font-black capitalize text-slate-950">
                {statusLabel.replace("_", " ")}
              </p>
              {application?.admin_note ? (
                <p className="mt-3 text-sm leading-7 text-amber-700">
                  Admin izohi: {application.admin_note}
                </p>
              ) : null}
              {message ? (
                <p className="mt-3 text-sm font-semibold text-emerald-800">
                  {message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Instructor arizasi
            </h2>
            <form action={submitInstructorApplication} className="mt-6 space-y-5">
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Professional title
                <input
                  name="professional_title"
                  defaultValue={application?.professional_title ?? ""}
                  placeholder="Senior Data Instructor"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                />
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Tashkilot
                  <input
                    name="organization_name"
                    defaultValue={application?.organization_name ?? ""}
                    placeholder="Kings Academy, Najot Ta'lim, freelance..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Kontakt email
                  <input
                    name="contact_email"
                    type="email"
                    defaultValue={application?.contact_email ?? ""}
                    placeholder="name@example.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Telefon
                  <input
                    name="contact_phone"
                    defaultValue={application?.contact_phone ?? ""}
                    placeholder="+998..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                  />
                </label>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  Profil rasmi URL
                  <input
                    name="photo_url"
                    defaultValue={application?.photo_url ?? ""}
                    placeholder="https://..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                  />
                </label>
              </div>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Public bio
                <textarea
                  name="public_bio"
                  defaultValue={application?.public_bio ?? ""}
                  rows={3}
                  placeholder="Studentlarga ko'rinadigan qisqa bio, tajriba va yondashuvingiz."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Expertise
                <textarea
                  name="expertise"
                  defaultValue={application?.expertise ?? ""}
                  rows={3}
                  placeholder="Qaysi yo'nalishda dars bera olasiz?"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Portfolio URL
                <input
                  name="portfolio_url"
                  defaultValue={application?.portfolio_url ?? ""}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Sertifikat va credentiallar
                <textarea
                  name="certificates"
                  defaultValue={
                    Array.isArray(application?.certificates)
                      ? application.certificates
                          .map((item) => (typeof item === "string" ? item : ""))
                          .filter(Boolean)
                          .join("\n")
                      : ""
                  }
                  rows={3}
                  placeholder="Har qatorda bitta sertifikat yoki credential yozing."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                />
              </label>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-900">
                  Certificate template
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    name="certificate_title"
                    defaultValue={
                      typeof application?.certificate_template?.title === "string"
                        ? application.certificate_template.title
                        : ""
                    }
                    placeholder="Certificate title"
                    className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-700"
                  />
                  <input
                    name="certificate_organization"
                    defaultValue={
                      typeof application?.certificate_template?.organizationName === "string"
                        ? application.certificate_template.organizationName
                        : ""
                    }
                    placeholder="Organization name on certificate"
                    className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-700"
                  />
                  <input
                    name="certificate_signature"
                    defaultValue={
                      typeof application?.certificate_template?.signatureName === "string"
                        ? application.certificate_template.signatureName
                        : ""
                    }
                    placeholder="Signature name"
                    className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-700"
                  />
                  <input
                    name="certificate_seal"
                    defaultValue={
                      typeof application?.certificate_template?.sealText === "string"
                        ? application.certificate_template.sealText
                        : ""
                    }
                    placeholder="Seal text"
                    className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Payout method
                <input
                  name="payout_method"
                  defaultValue={application?.payout_method ?? ""}
                  placeholder="Bank karta, hisob raqam yoki kelishuv"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Statement
                <textarea
                  name="statement"
                  defaultValue={application?.statement ?? ""}
                  rows={6}
                  placeholder="Nima uchun instructor bo'lmoqchisiz, qanday kurs yaratasiz, studentlarga qanday yordam berasiz?"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 normal-case tracking-normal text-slate-950 outline-none focus:border-emerald-700"
                  required
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-950 px-5 py-4 text-sm font-black text-white transition-colors hover:bg-emerald-800"
              >
                Arizani yuborish <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default async function InstructorDashboardPage({
  searchParams,
}: InstructorPageProps) {
  const [{ application_status: applicationStatus }, { supabase, user }] =
    await Promise.all([
      searchParams,
      requireAuthenticatedPage("/login?redirect=/instructor"),
    ]);
  const hasInstructorAccess = await isInstructorUser(
    supabase,
    user.id,
    user.email
  );

  if (!hasInstructorAccess) {
    const application = await getInstructorApplication(user.id, supabase);
    return (
      <InstructorApplicationGate
        application={application}
        status={applicationStatus}
      />
    );
  }

  const data = await getInstructorWorkspaceData(user.id, supabase);
  const maxRevenue = Math.max(...data.revenueSeries.map((item) => item.value), 1);
  const statCards = [
    {
      label: "Total students",
      value: data.metrics.totalStudents.toLocaleString("uz-UZ"),
      meta: `${data.metrics.averageProgress}% avg progress`,
      icon: Users,
      tint: "bg-emerald-100 text-emerald-900",
    },
    {
      label: "Total revenue",
      value: `${formatMoney(data.metrics.totalRevenue)} so'm`,
      meta: `${formatMoney(data.metrics.estimatedPayout)} payout est.`,
      icon: WalletCards,
      tint: "bg-orange-100 text-orange-900",
    },
    {
      label: "Avg rating",
      value: `${data.metrics.averageRating || 0}/5`,
      meta: `${data.metrics.publishedCourses} published`,
      icon: Sparkles,
      tint: "bg-sky-100 text-sky-900",
    },
    {
      label: "Open Q&A",
      value: data.metrics.openQuestions.toLocaleString("uz-UZ"),
      meta: `${data.metrics.uploadedAssets} media assets`,
      icon: MessageSquare,
      tint: "bg-purple-100 text-purple-900",
    },
  ];
  const controlModules = [
    {
      label: "My Courses",
      href: "/instructor/submissions",
      icon: FileText,
      metric: `${data.submissions.length} submissions`,
      detail: `${data.metrics.draftCourses} draft, ${data.metrics.reviewQueue} review, ${data.metrics.publishedCourses} public`,
    },
    {
      label: "Students",
      href: "/instructor/students",
      icon: Users,
      metric: `${data.students.length} active students`,
      detail: `${data.metrics.averageProgress}% avg progress, ${data.metrics.completedStudents} completed`,
    },
    {
      label: "Analytics",
      href: "/instructor/analytics",
      icon: BarChart3,
      metric: `${data.metrics.totalLearningHours} learning hours`,
      detail: `${formatMoney(data.metrics.totalRevenue)} so'm gross revenue`,
    },
    {
      label: "Media Uploads",
      href: "/instructor/assets",
      icon: UploadCloud,
      metric: `${data.metrics.uploadedAssets} assets`,
      detail: "Video, resource, lesson mapping va metadata analysis",
    },
    {
      label: "Student Q&A",
      href: "/instructor/questions",
      icon: MessageSquare,
      metric: `${data.metrics.openQuestions} open questions`,
      detail: "Savollarga javob berish va notification queue",
    },
    {
      label: "Financials",
      href: "/instructor/financial",
      icon: WalletCards,
      metric: `${formatMoney(data.metrics.estimatedPayout)} so'm payout`,
      detail: `${data.orders.length} paid orders, ${data.payouts.length} payout batches`,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      metric: "Profile & support",
      detail: "Bio, organization, security va support request",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-10 px-10 py-10">
      <InstructorLivePulse
        initialSnapshot={{
          generatedAt: new Date().toISOString(),
          metrics: data.metrics,
          workbench: {
            totalSubmissions: data.submissions.length,
            draftCourses: data.metrics.draftCourses,
            reviewQueue: data.metrics.reviewQueue,
            publishedCourses: data.metrics.publishedCourses,
            uploadedAssets: data.metrics.uploadedAssets,
            openQuestions: data.metrics.openQuestions,
            paidOrders: data.orders.length,
            payoutBatches: data.payouts.length,
            activeStudents: data.students.length,
          },
        }}
      />

      <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Real-time academic ecosystem monitoring active
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Curator Insights
          </h1>
          <p className="mt-3 text-base text-slate-600">
            {data.profile.name} uchun kurs, student, Q&A va financial overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/instructor/submissions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
          >
            Create New Course <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/instructor/assets"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 text-sm font-black text-emerald-950 hover:bg-emerald-200"
          >
            Upload Media <UploadCloud className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              Instructor control matrix
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              O'qituvchining barcha boshqaruv oynalari
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Bu panel faqat admin approve qilgan instructor uchun ochiladi:
              kurs, student, analytics, Q&A, media va financial hammasi real data bilan.
            </p>
          </div>
          <Link
            href="/instructor/submissions/new"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-emerald-900 hover:text-emerald-950"
          >
            <ArrowRight className="h-4 w-4" />
            New course workflow
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {controlModules.map((module) => (
            <Link
              key={module.label}
              href={module.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-800 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                  <module.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-800">
                  Approved
                </span>
              </div>
              <h3 className="mt-4 text-base font-black text-slate-950">
                {module.label}
              </h3>
              <p className="mt-2 text-sm font-black text-emerald-900">
                {module.metric}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {module.detail}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.tint}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-black text-emerald-700">LIVE</span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.meta}</p>
          </article>
        ))}
      </section>

      <section className="mb-10 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]">
        <div className="rounded-xl border border-slate-200 bg-[#eef3ff] p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Revenue Performance
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Monthly earnings across curated content
              </p>
            </div>
            <span className="rounded-lg bg-emerald-950 px-4 py-2 text-xs font-black text-white">
              MONTHLY
            </span>
          </div>
          <div className="flex h-72 items-end gap-6">
            {data.revenueSeries.map((month, index) => (
              <div key={month.key} className="flex h-full flex-1 flex-col justify-end gap-4">
                <div
                  className={`rounded-t-md ${
                    index === data.revenueSeries.length - 2
                      ? "bg-emerald-800"
                      : "bg-emerald-200"
                  }`}
                  style={{
                    height: `${Math.max(8, (month.value / maxRevenue) * 100)}%`,
                  }}
                />
                <span className="text-center text-[11px] font-black text-slate-500">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">System Pulse</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                title: "Review queue",
                value: `${data.metrics.reviewQueue} kurs`,
                icon: Clock3,
              },
              {
                title: "Learning hours",
                value: `${data.metrics.totalLearningHours} soat`,
                icon: BookOpen,
              },
              {
                title: "Completed students",
                value: `${data.metrics.completedStudents} student`,
                icon: CheckCircle2,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-emerald-800" />
                  <p className="font-black text-slate-950">{item.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-emerald-950">
              Curated Inventory
            </h2>
            <p className="mt-1 text-slate-600">
              Direct module, media and price monitoring
            </p>
          </div>
          <Link href="/instructor/submissions" className="text-sm font-black text-emerald-900">
            View All Courses
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {data.courseCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-8 py-12 text-center text-sm text-slate-500 xl:col-span-3">
              Hali published kurs yo'q. Yangi kurs yarating va public qiling.
            </div>
          ) : (
            data.courseCards.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/instructor/submissions`}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-800"
              >
                <span className="rounded bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-800">
                  Published
                </span>
                <h3 className="mt-5 line-clamp-2 text-xl font-black text-slate-950">
                  {course.title}
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <span>{course.students} enrolled</span>
                  <span>{course.assets} assets</span>
                  <span>{course.lessonCount} lessons</span>
                  <span>{formatMoney(course.revenue)} so'm</span>
                </div>
                <p className="mt-5 text-xs text-slate-400">
                  Last edit: {formatDate(course.updatedAt)}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Latest Student Questions</h2>
          <div className="mt-5 space-y-4">
            {data.recentQuestions.length === 0 ? (
              <p className="text-sm text-slate-500">Hali student savollari yo'q.</p>
            ) : (
              data.recentQuestions.slice(0, 4).map((question) => (
                <Link
                  key={question.id}
                  href="/instructor/questions"
                  className="block rounded-2xl border border-slate-100 p-4 hover:bg-slate-50"
                >
                  <p className="font-black text-slate-950">{question.studentName}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {question.question_text}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-600">
                    {question.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Recent Uploads</h2>
          <div className="mt-5 space-y-4">
            {data.assets.length === 0 ? (
              <p className="text-sm text-slate-500">Hali media yuklanmagan.</p>
            ) : (
              data.assets.slice(0, 4).map((asset) => (
                <Link
                  key={asset.id}
                  href="/instructor/assets"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50"
                >
                  <span>
                    <span className="block font-black text-slate-950">
                      {asset.title}
                    </span>
                    <span className="text-sm text-slate-500">
                      {asset.mime_type ?? asset.asset_type}
                    </span>
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase text-emerald-800">
                    {asset.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
