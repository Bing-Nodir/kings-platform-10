import { products } from "@/lib/catalog";
import { ShoppingBag, ShieldCheck, Sparkles } from "lucide-react";
import ShopGrid from "@/components/ShopGrid";
import Footer from "@/components/Footer";

export default function ShopPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Header */}
        <section className="border-b bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" /> Student essentials
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
                O&apos;qish va ish jarayoni uchun kerakli resurslar
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Template, planner va tayyor kitlar orqali o&apos;qish
                jarayoningizni tezlashtiring.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          {/* Feature cards */}
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <ShoppingBag className="mb-3 h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Saralangan mahsulotlar
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Jamoamiz tavsiya qilgan foydali materiallar.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Ishonchli to&apos;lov
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Barcha xaridlar uchun xavfsiz va shaffof jarayon.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <Sparkles className="mb-3 h-5 w-5 text-fuchsia-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Doimiy yangilanadi
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Kurslar va career yo&apos;nalishlariga mos yangi packlar
                qo&apos;shiladi.
              </p>
            </div>
          </div>

          {/* Client-side filterable product grid */}
          <ShopGrid products={products} />
        </section>
      </main>
      <Footer />
    </>
  );
}
