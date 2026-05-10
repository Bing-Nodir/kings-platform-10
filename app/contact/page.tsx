import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Footer from "@/components/Footer";
import { getCompanyContactData, getOfficeLocationsData } from "@/lib/content-store";
import { submitContactForm } from "./actions";

interface ContactPageProps {
  searchParams: Promise<{ sent?: string; error?: string }>;
}

export const revalidate = 300;

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { sent, error } = await searchParams;
  const [companyContact, officeLocations] = await Promise.all([
    getCompanyContactData(),
    getOfficeLocationsData(),
  ]);
  const primaryOffice = officeLocations[0];

  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Biz bilan bog&apos;laning
            </h1>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Savol yoki takliflaringiz uchun murojaat qiling
            </p>
          </div>

          {sent === "1" && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              Xabaringiz yuborildi. Jamoamiz siz bilan tez orada bog&apos;lanadi.
            </div>
          )}

          {error === "missing" && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              Iltimos, barcha maydonlarni to&apos;ldiring.
            </div>
          )}

          {error === "invalid_email" && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              Email manzilini to&apos;g&apos;ri formatda kiriting.
            </div>
          )}

          {error === "save_failed" && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              Xabarni saqlashda muammo bo&apos;ldi. Supabase migration&apos;lari to&apos;liq ishga tushganini tekshirib, qayta urinib ko&apos;ring.
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: companyContact.email,
                  href: `mailto:${companyContact.email}`,
                },
                {
                  icon: Phone,
                  label: "Telefon",
                  value: companyContact.phoneDisplay,
                  href: companyContact.phoneHref,
                },
                {
                  icon: MapPin,
                  label: "Manzil",
                  value:
                    primaryOffice?.address && primaryOffice?.city
                      ? `${primaryOffice.address}, ${primaryOffice.city}`
                      : "Toshkent, Mirzo Ulug'bek tumani",
                  href: "/offices",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">{item.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-8 lg:col-span-2">
              <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
                Xabar yuborish
              </h2>
              <form action={submitContactForm} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Ism
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ismingiz"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Mavzu
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Xabar mavzusi"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Xabar
                  </label>
                  <textarea
                    rows={5}
                    name="message"
                    placeholder="Xabaringizni yozing..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                  Yuborish
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
