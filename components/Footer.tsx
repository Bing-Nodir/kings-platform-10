import Link from "next/link";
import { Building2, CreditCard, Phone, Send, Users2 } from "lucide-react";
import { PaymentLogoBadge } from "@/components/PaymentLogos";
import { getCompanyContactData } from "@/lib/content-store";
import { getSiteContent } from "@/lib/site-content";

const quickLinks = [
  {
    href: "/about",
    label: "Biz haqimizda",
    mark: "KE",
    icon: Users2,
    ariaLabel: "Kings Education haqida",
    accent: "from-blue-500/20 via-cyan-400/10 to-white/5",
  },
  {
    href: "/contact",
    label: "Aloqa",
    mark: "24",
    icon: Send,
    ariaLabel: "Aloqa markazi",
    accent: "from-emerald-500/20 via-teal-400/10 to-white/5",
  },
  {
    href: "/subscription",
    label: "Rejalar",
    mark: "PRO",
    icon: CreditCard,
    ariaLabel: "Subscription rejalari",
    accent: "from-amber-400/20 via-yellow-300/10 to-white/5",
  },
  {
    href: "/offices",
    label: "Ofislar",
    mark: "O2O",
    icon: Building2,
    ariaLabel: "Ofislar va kampuslar",
    accent: "from-violet-500/20 via-indigo-400/10 to-white/5",
  },
];

export default async function Footer() {
  const [siteContent, companyContact] = await Promise.all([
    getSiteContent(),
    getCompanyContactData(),
  ]);

  return (
    <footer className="cv-auto border-t border-gray-200 bg-white pb-8 pt-16 dark:border-gray-800 dark:bg-black">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-extrabold tracking-tighter text-black dark:text-white">
                Kings<span className="text-blue-600">.</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {siteContent.footerDescription}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 sm:flex sm:flex-wrap">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative isolate min-h-16 overflow-hidden rounded-2xl border border-gray-200 bg-white px-3 py-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 sm:min-w-36"
                  aria-label={item.ariaLabel}
                >
                  <div
                    className={`absolute inset-0 -z-10 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-900 shadow-inner dark:border-white/10 dark:bg-white/10 dark:text-white">
                      <item.icon className="h-4 w-4" />
                      <span className="absolute -right-1 -top-1 rounded-md border border-white/70 bg-white px-1 text-[9px] font-black leading-4 text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-white">
                        {item.mark}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                        Kings
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <a
                href={companyContact.phoneHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <Phone className="h-4 w-4" />
                {companyContact.phoneDisplay}
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Platforma
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/courses" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Barcha kurslar
                </Link>
              </li>
              <li>
                <Link href="/shop" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Do'kon
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Obuna rejalari
                </Link>
              </li>
              <li>
                <Link href="/business" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Korporativ ta&apos;lim
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Reyting
                </Link>
              </li>
              <li>
                <Link href="/offices" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Oflayn ofislar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Kompaniya
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/about" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Mentorlar
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Aloqa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Yuridik
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Maxfiylik siyosati
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Ommaviy ofera
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  To&apos;lov va refund
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-gray-100 pt-8 sm:flex-row dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Kings Education. Barcha huquqlar himoyalangan.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-0 sm:justify-end sm:pr-20">
            <PaymentLogoBadge brand="payme" />
            <PaymentLogoBadge brand="click" />
            <PaymentLogoBadge brand="visa" />
          </div>
        </div>
      </div>
    </footer>
  );
}
