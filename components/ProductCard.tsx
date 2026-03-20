import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  inStock: boolean;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  category,
  rating,
  inStock,
}: ProductCardProps) {
  return (
    <article
      id={`product-${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-400/50 dark:hover:bg-gray-900/80 dark:hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-50 transition-transform duration-500 group-hover:scale-105 dark:from-gray-800 dark:to-gray-900" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur-sm dark:bg-black/90 dark:text-white">
            {category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`text-xs font-medium ${
              inStock
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {inStock ? "Sotuvda mavjud" : "Tugagan"}
          </span>
          <div className="flex items-center text-xs font-medium text-amber-500">
            <Star className="mr-1 h-3.5 w-3.5 fill-current" />
            {rating}
          </div>
        </div>
        <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="mb-6 flex-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-black text-gray-900 dark:text-white">
            {price.toLocaleString()} UZS
          </span>
          {inStock ? (
            <Link
              href={`/checkout?type=product&id=${id}`}
              aria-label={`${name} mahsulotini sotib olish`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
            >
              <ShoppingBag className="h-4 w-4" />
            </Link>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-900">
              <ShoppingBag className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
