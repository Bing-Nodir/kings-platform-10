import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle,
  GraduationCap,
  Globe,
  Mail,
  Phone,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import BusinessPixelateWipe from "@/components/BusinessPixelateWipe";
import Footer from "@/components/Footer";
import VintageBusinessCta from "@/components/VintageBusinessCta";
import {
  getBusinessBenefitsData,
  getBusinessPlansData,
  getBusinessTestimonialsData,
  getBusinessWorkflowStepsData,
  getCompanyContactData,
  getLiveCompanyStatsData,
  getCoursesData,
} from "@/lib/content-store";

export const revalidate = 300;

const businessIcons = {
  BarChart3,
  BookOpen,
  GraduationCap,
  Zap,
  Globe,
  Shield,
  Users,
} as const;

export default async function BusinessPage() {
  const [
    companyContact,
    companyStats,
    courses,
    businessPlans,
    businessBenefits,
    businessTestimonials,
    workflowSteps,
  ] = await Promise.all([
    getCompanyContactData(),
    getLiveCompanyStatsData(),
    getCoursesData(),
    getBusinessPlansData(),
    getBusinessBenefitsData(),
    getBusinessTestimonialsData(),
    getBusinessWorkflowStepsData(),
  ]);

  const benefits = businessBenefits.map((benefit) =>
    benefit.metric === "courses_count"
      ? { ...benefit, title: `${courses.length} ta professional kurs` }
      : benefit
  );

  return (
    <>
      <main className="min-h-screen">
        <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-slate-950 px-4 py-[clamp(4rem,9svh,7rem)] text-white sm:min-h-[calc(100svh-6rem)]">
          <BusinessPixelateWipe />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(2,6,23,0.94)_0%,rgba(2,6,23,0.86)_34%,rgba(2,6,23,0.58)_58%,rgba(2,6,23,0.8)_100%),linear-gradient(90deg,rgba(2,6,23,0.88),rgba(2,6,23,0.42)_48%,rgba(2,6,23,0.8)),radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.14),transparent_56%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
          <div className="relative z-10 mx-auto w-full min-w-0 max-w-5xl text-center">
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <Building2 className="h-4 w-4" /> Korporativ Ta'lim Yechimi
              </span>
              <h1 className="mx-auto max-w-[23rem] break-words text-[clamp(2.2rem,9.5vw,3.75rem)] font-black leading-tight sm:max-w-none sm:text-5xl lg:text-6xl">
                Jamoangizni{" "}
                <span className="text-amber-300">professional</span>
                <br />
                darajaga <span className="block sm:inline">yetkazing</span>
              </h1>
              <p className="mx-auto mt-6 w-full max-w-[22rem] text-base leading-relaxed text-white/80 sm:max-w-2xl sm:text-lg">
                Data Analytics, AI, Power BI, SQL va ACCA IFRS bo'yicha
                professional kurslar, korporativ tarifda, real analytics va AI
                Mentor bilan.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/contact"
                  className="inline-flex w-full max-w-[19.5rem] items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-xl transition-all hover:bg-blue-50 sm:w-auto sm:max-w-none sm:px-8"
                >
                  Bepul demo so'rash <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#plans"
                  className="inline-flex w-full max-w-[19.5rem] items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto sm:max-w-none sm:px-8"
                >
                  Narxlarni ko'rish
                </Link>
                <Link
                  href="/instructor"
                  className="inline-flex w-full max-w-[19.5rem] items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-300/20 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-emerald-300/30 sm:w-auto sm:max-w-none sm:px-8"
                >
                  Instructor bo'lish <GraduationCap className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-gray-800 sm:grid-cols-4 sm:divide-y-0">
            {companyStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 px-6 py-8"
              >
                <span className="text-3xl font-black text-blue-600">
                  {stat.value}
                </span>
                <span className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50/50 px-4 py-16 dark:bg-black md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Nima uchun Kings Education?
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Raqobatbardosh jamoani qurishning eng samarali yo'li
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon =
                  businessIcons[benefit.iconKey as keyof typeof businessIcons] ?? BarChart3;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className={`mb-4 inline-flex rounded-2xl p-3 ${benefit.bg}`}>
                      <Icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {benefit.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="plans" className="bg-white px-4 py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Korporativ tariflar
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Jamoangiz kattaligiga mos tarif tanlang
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {businessPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm dark:bg-gray-950 ${plan.color} ${plan.badge ? "shadow-xl" : ""}`}
                >
                  {plan.badge ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                      {plan.badge}
                    </span>
                  ) : null}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.price !== "Kelishiladi" ? (
                        <span className="ml-1 text-sm font-medium text-gray-400">
                          {" "}
                          so'm
                        </span>
                      ) : null}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {plan.priceNote}
                      </p>
                    </div>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <VintageBusinessCta
          contactEmail={companyContact.email}
          phoneDisplay={companyContact.phoneDisplay}
          phoneHref={companyContact.phoneHref}
        />

        <section className="bg-gray-50/50 px-4 py-16 dark:bg-black md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Mijozlarimiz fikri
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {businessTestimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.stars }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="theme-hidden-vintage bg-blue-600 px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              Jamoangizni kuchaytirishga tayyormisiz?
            </h2>
            <p className="mt-4 text-blue-100">
              Bugun bepul demo oling, 30 daqiqada platformani to'liq ko'rsatamiz
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-xl transition-all hover:bg-blue-50"
              >
                <Mail className="h-4 w-4" /> Murojaat qiling
              </Link>
              <a
                href={companyContact.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> {companyContact.phoneDisplay}
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Korporativ panel qanday ishlaydi?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {workflowSteps.map((step) => {
                const Icon =
                  businessIcons[step.iconKey as keyof typeof businessIcons] ?? Users;

                return (
                  <div key={`${step.step}-${step.title}`} className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-blue-600">
                      QADAM {step.step}
                    </span>
                    <h3 className="mt-2 font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
