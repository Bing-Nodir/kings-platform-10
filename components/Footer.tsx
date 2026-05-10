import Link from "next/link";
import { Building2, CreditCard, Phone, Send, Users2 } from "lucide-react";
import { PaymentLogoBadge } from "@/components/PaymentLogos";
import { getCompanyContactData } from "@/lib/content-store";
import { getSiteContent } from "@/lib/site-content";

const quickLinks = [
  {
    href: "/about",
    label: "Biz haqimizda",
    icon: Users2,
    ariaLabel: "Kings Education haqida",
  },
  {
    href: "/contact",
    label: "Aloqa",
    icon: Send,
    ariaLabel: "Aloqa markazi",
  },
  {
    href: "/subscription",
    label: "Rejalar",
    icon: CreditCard,
    ariaLabel: "Subscription rejalari",
  },
  {
    href: "/offices",
    label: "Ofislar",
    icon: Building2,
    ariaLabel: "Ofislar va kampuslar",
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
            <div className="flex flex-wrap gap-3 pt-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
                  aria-label={item.ariaLabel}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
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
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400">
                  Subscription
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
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-0 sm:justify-end">
            <PaymentLogoBadge brand="payme" />
            <PaymentLogoBadge brand="click" />
            <PaymentLogoBadge brand="visa" />
          </div>
        </div>
      </div>
    </footer>
  );
}
