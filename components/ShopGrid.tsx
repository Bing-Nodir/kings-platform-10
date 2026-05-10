"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  DownloadCloud,
  PackageCheck,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";

interface ShopGridProps {
  products: Product[];
}

function formatPrice(value: number) {
  return `${value.toLocaleString("uz-UZ")} UZS`;
}

function isAvailable(product: Product) {
  return product.inStock && product.status !== "sold_out";
}

export default function ShopGrid({ products }: ShopGridProps) {
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [deliveryMode, setDeliveryMode] = useState<"all" | "digital" | "physical">("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["Barchasi", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return products
      .filter((product) =>
        activeCategory === "Barchasi" ? true : product.category === activeCategory
      )
      .filter((product) =>
        deliveryMode === "all"
          ? true
          : deliveryMode === "digital"
            ? product.isDigital !== false
            : product.isDigital === false
      )
      .filter((product) => {
        if (!needle) return true;

        return [product.name, product.description, product.category]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      });
  }, [activeCategory, deliveryMode, products, query]);

  const featured =
    filtered.find((product) => isAvailable(product)) ??
    products.find((product) => isAvailable(product)) ??
    products[0];
  const digitalCount = filtered.filter((product) => product.isDigital !== false).length;
  const readyCount = filtered.filter(isAvailable).length;
  const averageRating =
    filtered.length > 0
      ? filtered.reduce((sum, product) => sum + product.rating, 0) / filtered.length
      : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="border-y border-black/10 py-5 dark:border-white/10">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Resurs qidirish"
              className="h-12 w-full border border-black/15 bg-white pl-10 pr-3 text-sm font-medium text-gray-950 outline-none transition focus:border-emerald-700 dark:border-white/15 dark:bg-[#0c0f0d] dark:text-white"
            />
          </label>

          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-gray-400">
              <SlidersHorizontal className="h-4 w-4" />
              Delivery
            </p>
            <div className="grid grid-cols-3 gap-px bg-black/10 dark:bg-white/10">
              {[
                { value: "all", label: "All", icon: SlidersHorizontal },
                { value: "digital", label: "Digital", icon: DownloadCloud },
                { value: "physical", label: "Print", icon: PackageCheck },
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() =>
                    setDeliveryMode(mode.value as "all" | "digital" | "physical")
                  }
                  className={`flex h-12 items-center justify-center gap-2 text-xs font-black transition ${
                    deliveryMode === mode.value
                      ? "bg-[#10151d] text-white dark:bg-emerald-400 dark:text-black"
                      : "bg-white text-gray-500 hover:text-gray-950 dark:bg-[#0c0f0d] dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-gray-400">
              Category
            </p>
            <div className="grid gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center justify-between border px-3 py-3 text-left text-sm font-bold transition ${
                    activeCategory === category
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-300 dark:bg-emerald-300/10 dark:text-emerald-100"
                      : "border-black/10 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-950 dark:border-white/10 dark:bg-[#0c0f0d] dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <span>{category}</span>
                  {activeCategory === category ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-px bg-black/10 text-center dark:bg-white/10">
            {[
              ["Shown", filtered.length],
              ["Ready", readyCount],
              ["Digital", digitalCount],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-2 py-4 dark:bg-[#0c0f0d]">
                <p className="text-lg font-black">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        {featured ? (
          <section className="grid overflow-hidden border border-black/10 bg-white lg:grid-cols-[minmax(0,1fr)_360px] dark:border-white/10 dark:bg-[#0c0f0d]">
            <div className="p-5 md:p-7">
              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gray-400">
                <span>Featured pick</span>
                <span className="h-px w-8 bg-gray-300 dark:bg-gray-700" />
                <span>{featured.category}</span>
              </div>
              <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                <div className="relative h-44 overflow-hidden border border-black/10 bg-[#dfe8e6] dark:border-white/10 dark:bg-[#10151d]">
                  {featured.imageUrl ? (
                    <div
                      role="img"
                      aria-label={featured.name}
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${featured.imageUrl})` }}
                    />
                  ) : (
                    <div className="grid h-full place-items-center p-4 text-center">
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">
                        Kings resource
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight md:text-5xl">
                    {featured.name}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {featured.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="text-2xl font-black">
                      {formatPrice(featured.price)}
                    </span>
                    <span className="border border-black/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:border-white/10">
                      Rating {featured.rating}
                    </span>
                    <span className="border border-black/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:border-white/10">
                      {featured.isDigital === false ? "Physical" : "Digital"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-black/10 bg-[#10151d] p-5 text-white lg:border-l lg:border-t-0 dark:border-white/10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                  Purchase lane
                </p>
                <p className="mt-4 text-sm leading-7 text-white/68">
                  To&apos;lovdan keyin order history va billing receipt shu accountga
                  ulanadi.
                </p>
              </div>
              {isAvailable(featured) ? (
                <Link
                  href={`/checkout?type=product&id=${featured.id}`}
                  className="mt-6 inline-flex h-12 items-center justify-between border border-white/20 px-4 text-sm font-black uppercase tracking-[0.12em] transition hover:border-emerald-300 hover:bg-emerald-300 hover:text-black"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="mt-6 inline-flex h-12 items-center border border-white/20 px-4 text-sm font-black uppercase tracking-[0.12em] text-white/45">
                  Sotuv yopiq
                </span>
              )}
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-2 border-b border-black/10 pb-4 md:flex-row md:items-center md:justify-between dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              Catalog floor
            </p>
            <h3 className="mt-1 text-xl font-black">
              {filtered.length} ta mahsulot saralandi
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            O&apos;rtacha reyting: {averageRating ? averageRating.toFixed(1) : "0.0"}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} index={index + 1} {...product} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-black/20 bg-white px-6 py-14 text-center dark:border-white/20 dark:bg-[#0c0f0d]">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Bu filtrda mahsulot topilmadi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
