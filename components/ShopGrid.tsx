"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";
import { SlidersHorizontal } from "lucide-react";

interface ShopGridProps {
  products: Product[];
}

export default function ShopGrid({ products }: ShopGridProps) {
  const [activeCategory, setActiveCategory] = useState("Barchasi");

  const categories = [
    "Barchasi",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filtered =
    activeCategory === "Barchasi"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-8">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtr:</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 dark:text-gray-500">
          {filtered.length} ta mahsulot
        </span>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-950">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Bu kategoriyada hozircha mahsulot yo&apos;q.
          </p>
        </div>
      )}
    </div>
  );
}
