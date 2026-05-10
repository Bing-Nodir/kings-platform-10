import { Clock3, ExternalLink, MapPin, Phone, QrCode } from "lucide-react";
import Footer from "@/components/Footer";
import { getOfficeLocationsData } from "@/lib/content-store";

export const revalidate = 300;

export default async function OfficesPage() {
  const officeLocations = await getOfficeLocationsData();
  const hqOffice = officeLocations[0];

  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-black">
        <section className="border-b border-gray-200/70 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="container mx-auto px-4 py-16 md:px-8 md:py-24">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <MapPin className="h-4 w-4" /> Offline offices
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white md:text-6xl">
                Kings Education kampuslari
              </h1>
              <p className="text-lg leading-8 text-gray-600 dark:text-gray-400">
                {officeLocations.length} ta shahardagi kampuslarimizda workshop, mentor session va oflayn darslarda qatnashing.
              </p>

              {/* City badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {officeLocations.map((office) => (
                  <span
                    key={office.city + office.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    {office.city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          {/* Office cards grid */}
          <div className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {officeLocations.map((office, idx) => (
              <div
                key={office.name}
                className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
              >
                {/* Color banner */}
                <div
                  className={`h-2 w-full ${
                    idx === 0
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                      : idx === 1
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : "bg-gradient-to-r from-purple-500 to-fuchsia-600"
                  }`}
                />
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    {office.city}
                  </p>
                  <h2 className="mt-1.5 text-xl font-black text-gray-950 dark:text-white">
                    {office.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {office.description}
                  </p>

                  <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{office.hours}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-500" />
                      <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        {office.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span>QR attendance va oflayn support</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Google Maps&apos;da ochish <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Main map — HQ */}
          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Kings Education HQ — Asosiy kampus
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {hqOffice?.address ?? "Asosiy kampus manzili hali kiritilmagan"}, {hqOffice?.city ?? "TBA"}
              </p>
            </div>
            <iframe
              title="Kings Education HQ xaritada"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                hqOffice?.mapQuery ?? "Tashkent"
              )}&output=embed`}
              className="h-[480px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* QR CTA */}
          <div className="mt-8 rounded-[2rem] border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
            <QrCode className="mx-auto mb-4 h-10 w-10 text-blue-500" />
            <h3 className="text-2xl font-black text-gray-950 dark:text-white">
              QR Attendance
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400">
              Dashboard sahifangizdan shaxsiy QR-chipangizni oling va kampuslarda skanerlang — davomat avtomatik qayd etiladi.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
