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
import Footer from "@/components/Footer";

const PLANS = [
  {
    name: "Starter",
    price: "1.2M",
    priceNote: "/ 5 ta ish'chi / oy",
    color: "border-gray-200 dark:border-gray-700",
    badge: null,
    features: [
      "5 ta xodim uchun ruxsat",
      "Barcha 8 ta kurs",
      "Progress monitoring",
      "Email qo'llab-quvvatlash",
      "Guruh sertifikatlari",
    ],
    cta: "Boshlash",
    ctaStyle: "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900",
  },
  {
    name: "Business",
    price: "3.5M",
    priceNote: "/ 15 ta xodim / oy",
    color: "border-blue-500 shadow-blue-100 dark:shadow-blue-900/20",
    badge: "Eng mashhur",
    features: [
      "15 ta xodim uchun ruxsat",
      "Barcha 8 ta kurs + yangilari",
      "Progress va analytics dashboard",
      "Prioritet qo'llab-quvvatlash",
      "Guruh sertifikatlari",
      "AI Mentor cheksiz",
      "Korporativ hisobotlar",
    ],
    cta: "Boshlash",
    ctaStyle: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
  },
  {
    name: "Enterprise",
    price: "Kelishiladi",
    priceNote: "/ cheksiz xodimlar",
    color: "border-purple-200 dark:border-purple-800",
    badge: null,
    features: [
      "Cheksiz xodimlar",
      "Maxsus kurs yaratish",
      "API integratsiya",
      "Dedicated account manager",
      "Offline trening imkoniyati",
      "SLA kafolati",
      "Maxsus brending",
    ],
    cta: "Murojaat qiling",
    ctaStyle: "border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/30",
  },
];

const BENEFITS = [
  {
    icon: BarChart3,
    title: "Real-time analytics",
    desc: "Har bir xodimning o'quv progressi, vaqti va quiz natijalarini real vaqtda kuzating.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: BookOpen,
    title: "8 ta professional kurs",
    desc: "Python, SQL, Power BI, AI, Data Analytics, ACCA IFRS va boshqa eng so'ralgan yo'nalishlar.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: GraduationCap,
    title: "Sertifikatlar",
    desc: "Har bir tugallangan kurs uchun rasmiy sertifikat — LinkedIn'ga qo'shish mumkin.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Zap,
    title: "AI Mentor 24/7",
    desc: "Har bir xodim Claude AI bilan shaxsiy mentorlik seanslari o'tkazishi mumkin.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Globe,
    title: "3 til qo'llab-quvvatlanadi",
    desc: "O'zbek, Rus va Ingliz tillarida — har bir xodim o'z tilida o'rganadi.",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: Shield,
    title: "Ma'lumotlar xavfsizligi",
    desc: "Supabase + RLS orqali ma'lumotlaringiz to'liq xavfsiz va faqat siz ko'rasiz.",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
];

const TESTIMONIALS = [
  {
    name: "Aziz Karimov",
    role: "CTO, TechSolutions Tashkent",
    quote: "Kings Education bilan 12 ta data analyst xodimimizni 3 oy ichida professional darajaga yetkazdi. ROI ajoyib!",
    stars: 5,
    avatar: "AK",
  },
  {
    name: "Nilufar Rashidova",
    role: "HR Director, Uzum Market",
    quote: "Analytics dashboard orqali har bir xodimning progressini kuzatish — biznes qarorlar qabul qilishni osonlashtirdi.",
    stars: 5,
    avatar: "NR",
  },
  {
    name: "Jasur Toshmatov",
    role: "CEO, FinTech Group",
    quote: "ACCA IFRS kursi bizning moliya jamoamizga katta qiymat qo'shdi. Platforma juda qulay va professional.",
    stars: 5,
    avatar: "JT",
  },
];

const STATS = [
  { label: "Korporativ mijozlar", value: "25+" },
  { label: "Trening olgan xodimlar", value: "400+" },
  { label: "O'rtacha o'sish", value: "68%" },
  { label: "Mijoz mamnuniyati", value: "98%" },
];

export default function BusinessPage() {
  return (
    <>
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-4 py-20 text-white md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Building2 className="h-4 w-4" /> Korporativ Ta'lim Yechimi
            </span>
            <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Jamoangizni <span className="text-yellow-300">professional</span><br />
              darajaga yetkazing
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Data Analytics, AI, Power BI, SQL va ACCA IFRS bo'yicha professional kurslar —
              korporativ tarifda, real analytics va AI Mentor bilan.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-xl transition-all hover:bg-blue-50"
              >
                Bepul demo so'rash <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#plans"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Narxlarni ko'rish
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-gray-800 sm:grid-cols-4 sm:divide-y-0">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-6 py-8">
                <span className="text-3xl font-black text-blue-600">{s.value}</span>
                <span className="text-center text-sm text-gray-500 dark:text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
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
              {BENEFITS.map((b) => (
                <div key={b.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div className={`mb-4 inline-flex rounded-2xl p-3 ${b.bg}`}>
                    <b.icon className={`h-6 w-6 ${b.color}`} />
                  </div>
                  <h3 className="mb-2 font-bold text-gray-900 dark:text-white">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
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
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm dark:bg-gray-950 ${plan.color} ${plan.badge ? "shadow-xl" : ""}`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                      {plan.price !== "Kelishiladi" && (
                        <span className="ml-1 text-sm font-medium text-gray-400"> so'm</span>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">{plan.priceNote}</p>
                    </div>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {f}
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

        {/* Testimonials */}
        <section className="bg-gray-50/50 px-4 py-16 dark:bg-black md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Mijozlarimiz fikri
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              Jamoangizni kuchaytirishga tayyormisiz?
            </h2>
            <p className="mt-4 text-blue-100">
              Bugun bepul demo oling — 30 daqiqada platformani to'liq ko'rsatamiz
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-xl transition-all hover:bg-blue-50"
              >
                <Mail className="h-4 w-4" /> Murojaat qiling
              </Link>
              <a
                href="tel:+998901234567"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> +998 90 123 45 67
              </a>
            </div>
          </div>
        </section>

        {/* Team features diagram */}
        <section className="bg-white px-4 py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Korporativ panel qanday ishlaydi?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { step: "01", title: "Xodimlarni qo'shing", desc: "Jamoa a'zolarini email orqali taklif qiling — ular darhol platformaga kiradi.", icon: Users },
                { step: "02", title: "Kurslarni belgilang", desc: "Har bir xodim yoki jamoa uchun tegishli kurslarni tanlang va belgilang.", icon: BookOpen },
                { step: "03", title: "Natijalarni kuzating", desc: "Analytics dashboardda har bir xodimning progressi va quiz natijalarini real vaqtda ko'ring.", icon: BarChart3 },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                    <s.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-blue-600">
                    QADAM {s.step}
                  </span>
                  <h3 className="mt-2 font-bold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
