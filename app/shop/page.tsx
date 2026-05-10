import {
  Banknote,
  FileCheck2,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react";
import ShopGrid from "@/components/ShopGrid";
import Footer from "@/components/Footer";
import { getProductsData } from "@/lib/content-store";

function formatCount(value: number) {
  return value.toLocaleString("uz-UZ");
}

export default async function ShopPage() {
  const products = await getProductsData();
  const activeProducts = products.filter(
    (product) => product.inStock && product.status !== "sold_out"
  );
  const digitalCount = products.filter((product) => product.isDigital !== false).length;
  const physicalCount = products.length - digitalCount;
  const inventoryCount = products.reduce(
    (sum, product) => sum + (product.inventoryCount ?? 0),
    0
  );

  return (
    <>
      <main className="min-h-screen bg-[#f4f6f8] text-[#10151d] dark:bg-[#060706] dark:text-white">
        <section className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-[#090b0a]">
          <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
              <div>
                <div className="mb-7 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                  <span className="border border-emerald-700/30 px-3 py-1.5 dark:border-emerald-300/30">
                    Edu shopping desk
                  </span>
                  <span className="text-gray-400">Digital + physical supply</span>
                </div>
                <h1 className="max-w-5xl text-4xl font-black leading-[0.98] text-[#0d1117] md:text-6xl lg:text-7xl dark:text-white">
                  Study tools, career kits va premium resurslar
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600 md:text-lg dark:text-gray-300">
                  Bu bo&apos;lim oddiy vitrina emas. Kursdan tashqaridagi amaliy
                  materiallar, interview pack, planner va template&apos;lar bitta
                  sotib olish oqimi, inventory nazorati va payment audit bilan
                  yuradi.
                </p>
              </div>

              <div className="border-l border-black/10 pl-6 dark:border-white/10">
                <div className="mb-5 flex items-center gap-3">
                  <PackageSearch className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Supply status
                  </p>
                </div>
                <dl className="grid grid-cols-2 border-y border-black/10 dark:border-white/10">
                  {[
                    ["Live items", formatCount(products.length)],
                    ["Available", formatCount(activeProducts.length)],
                    ["Digital", formatCount(digitalCount)],
                    ["Physical stock", formatCount(inventoryCount || physicalCount)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="border-b border-r border-black/10 px-4 py-5 last:border-r-0 even:border-r-0 dark:border-white/10"
                    >
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                        {label}
                      </dt>
                      <dd className="mt-2 text-3xl font-black">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 bg-[#10151d] text-white dark:border-white/10">
          <div className="mx-auto grid max-w-[1600px] gap-px bg-white/12 md:grid-cols-4">
            {[
              {
                icon: ReceiptText,
                label: "Checkout trail",
                value: "Order, payment intent va receipt bir zanjirda.",
              },
              {
                icon: Banknote,
                label: "Dynamic pricing",
                value: "Chegirma hooklari backend orqali yuradi.",
              },
              {
                icon: FileCheck2,
                label: "Access control",
                value: "Digital resurslar account billing bilan bog'lanadi.",
              },
              {
                icon: Truck,
                label: "Fulfillment",
                value: "Physical itemlar stock holati bilan ko'rinadi.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-[#10151d] px-5 py-6">
                <item.icon className="h-5 w-5 text-emerald-300" />
                <h2 className="mt-4 text-sm font-black uppercase tracking-[0.16em]">
                  {item.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12">
          <div className="mb-6 flex flex-col gap-3 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between dark:border-white/10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Resource procurement
              </p>
              <h2 className="mt-2 text-2xl font-black md:text-4xl">
                Shopping panel
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
              Navbar&apos;dagi nom o&apos;zgarmaydi. Ichki tajriba esa katalog,
              filtr, featured deal va product ticketlardan iborat alohida panel
              sifatida ishlaydi.
            </p>
          </div>

          <ShopGrid products={products} />
        </section>

        <section className="border-t border-black/10 bg-white dark:border-white/10 dark:bg-[#090b0a]">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-8 text-sm text-gray-600 md:flex-row md:items-center md:justify-between md:px-8 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              <span className="font-semibold">
                Har bir xarid checkout, receipt va billing tarixiga ulanadi.
              </span>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-gray-400">
              Kings Education commerce layer
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
