import Link from "next/link";
import {
  ArrowRight,
  DownloadCloud,
  PackageCheck,
  ShoppingBag,
  Star,
} from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  inStock: boolean;
  inventoryCount?: number | null;
  isDigital?: boolean;
  deliveryLabel?: string;
  imageUrl?: string;
  status?: "active" | "draft" | "archived" | "sold_out";
  index?: number;
}

function formatPrice(value: number) {
  return `${value.toLocaleString("uz-UZ")} UZS`;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  category,
  rating,
  inStock,
  inventoryCount,
  isDigital = true,
  deliveryLabel,
  imageUrl,
  status = "active",
  index = 1,
}: ProductCardProps) {
  const available = inStock && status !== "sold_out";
  const stockLabel = available
    ? inventoryCount === null || inventoryCount === undefined
      ? "Digital access ready"
      : `${inventoryCount} dona stock`
    : "Sotuv yopiq";

  return (
    <article
      id={`product-${id}`}
      className="group grid min-h-[360px] overflow-hidden border border-black/10 bg-white transition hover:border-emerald-700 dark:border-white/10 dark:bg-[#0c0f0d] dark:hover:border-emerald-300"
    >
      <div className="relative h-48 overflow-hidden border-b border-black/10 bg-[#dce5e2] dark:border-white/10 dark:bg-[#10151d]">
        {imageUrl ? (
          <div
            role="img"
            aria-label={name}
            className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#f8fafc_0_24%,#dbeafe_24%_25%,#f8fafc_25%_48%,#bbf7d0_48%_49%,#f8fafc_49%_74%,#fde68a_74%_75%,#f8fafc_75%)] dark:bg-[linear-gradient(135deg,#0c0f0d_0_24%,#14532d_24%_25%,#0c0f0d_25%_48%,#334155_48%_49%,#0c0f0d_49%_74%,#854d0e_74%_75%,#0c0f0d_75%)]" />
        )}

        <div className="absolute left-3 top-3 bg-white px-2 py-1 font-mono text-[11px] font-black text-gray-900 dark:bg-black dark:text-white">
          #{String(index).padStart(2, "0")}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-gray-900 dark:bg-black dark:text-white">
          {isDigital ? (
            <DownloadCloud className="h-3.5 w-3.5" />
          ) : (
            <PackageCheck className="h-3.5 w-3.5" />
          )}
          {isDigital ? "Digital" : "Physical"}
        </div>
      </div>

      <div className="flex flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="border border-black/10 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-gray-500 dark:border-white/10 dark:text-gray-400">
            {category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" />
            {rating}
          </span>
        </div>

        <h3 className="line-clamp-2 text-2xl font-black leading-tight text-gray-950 dark:text-white">
          {name}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {description}
        </p>

        <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className={`text-xs font-black uppercase tracking-[0.12em] ${
                  available
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {stockLabel}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {deliveryLabel ??
                  (isDigital
                    ? "To'lovdan keyin digital access"
                    : "Yetkazib berish admin bilan kelishiladi")}
              </p>
            </div>
            <ShoppingBag className="h-5 w-5 shrink-0 text-gray-400" />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xl font-black text-gray-950 dark:text-white">
              {formatPrice(price)}
            </span>
            {available ? (
              <Link
                href={`/checkout?type=product&id=${id}`}
                aria-label={`${name} mahsulotini sotib olish`}
                className="inline-flex h-11 items-center gap-2 border border-black bg-[#10151d] px-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-emerald-700 hover:bg-emerald-600 dark:border-white/15 dark:bg-white dark:text-black dark:hover:border-emerald-300 dark:hover:bg-emerald-300"
              >
                Olish
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-11 items-center border border-black/10 px-3 text-xs font-black uppercase tracking-[0.12em] text-gray-400 dark:border-white/10">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
