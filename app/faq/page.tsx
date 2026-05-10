import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare, Phone } from "lucide-react";
import Footer from "@/components/Footer";
import { getCompanyContactData, getFaqEntriesData } from "@/lib/content-store";

export const revalidate = 300;

export default async function FaqPage() {
  const [faqEntries, companyContact] = await Promise.all([
    getFaqEntriesData(),
    getCompanyContactData(),
  ]);
  const groupedEntries = Object.entries(
    faqEntries.reduce<Record<string, typeof faqEntries>>((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }

      acc[entry.category].push(entry);
      return acc;
    }, {})
  );
  const totalQuestions = faqEntries.length;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950">
        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
              <HelpCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Ko'p so'raladigan savollar
            </h1>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {totalQuestions} ta savol va javob kategoriyalar bo'yicha
            </p>
          </div>

          <div className="space-y-8">
            {groupedEntries.map(([category, items]) => (
              <div key={category}>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                  {category}
                </h2>
                <div className="space-y-2">
                  {items.map((faq) => (
                    <details
                      key={`${faq.category}-${faq.question}`}
                      className="group rounded-2xl border border-gray-100 bg-white shadow-sm transition-all open:shadow-md dark:border-gray-800 dark:bg-gray-950"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        <span>{faq.question}</span>
                        <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="border-t border-gray-50 px-6 pb-5 pt-4 text-sm leading-7 text-gray-600 dark:border-gray-800 dark:text-gray-400">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 dark:from-blue-950/30 dark:to-indigo-950/20">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Javob topa olmadingizmi?
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Jamoamiz 24 soat ichida javob beradi.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <MessageSquare className="h-4 w-4" /> Xabar yuborish
              </Link>
              <a
                href={companyContact.phoneHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                <Phone className="h-4 w-4" /> {companyContact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
