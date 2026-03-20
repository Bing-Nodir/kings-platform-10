"use client";

import { Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/components/WishlistProvider";

type ButtonVariant = "overlay" | "inline" | "compact";

interface CourseWishlistButtonProps {
  courseId: string;
  variant?: ButtonVariant;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  overlay:
    "rounded-full border border-white/25 bg-slate-950/55 px-3.5 py-2 text-white shadow-lg backdrop-blur-md hover:bg-slate-950/75",
  inline:
    "rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-sm hover:border-blue-200 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-900/60 dark:hover:text-blue-300",
  compact:
    "rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-700 hover:border-blue-200 hover:bg-white hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-900/60 dark:hover:bg-black dark:hover:text-blue-300",
};

export default function CourseWishlistButton({
  courseId,
  variant = "overlay",
  className,
}: CourseWishlistButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, backendReady, isSaved, isMutating, toggleWishlist } =
    useWishlist();
  const saved = isSaved(courseId);
  const mutating = isMutating(courseId);

  async function handleClick() {
    if (!backendReady) {
      return;
    }

    if (!isAuthenticated && !loading) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/courses")}`);
      return;
    }

    const result = await toggleWishlist(courseId);

    if (result.authRequired) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/courses")}`);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading || mutating || !backendReady}
      aria-pressed={saved}
      aria-label={
        backendReady
          ? saved
            ? "Kurs saqlangan ro'yxatdan olib tashlash"
            : "Kursni keyinroq ko'rish uchun saqlash"
          : "Wishlist backend hali tayyor emas"
      }
      title={
        backendReady
          ? saved
            ? "Saqlangan"
            : "Keyinroq ko'rish uchun saqlash"
          : "Wishlist backend hali tayyor emas"
      }
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
    >
      {loading || mutating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span className={variant === "compact" ? "hidden sm:inline" : ""}>
        {!backendReady ? "Soon" : saved ? "Saqlangan" : "Saqlash"}
      </span>
    </button>
  );
}
