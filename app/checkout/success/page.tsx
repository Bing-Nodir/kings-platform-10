import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  LayoutDashboard,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCourseById, getProductById } from "@/lib/catalog";
import { createClient } from "@/utils/supabase/server";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string; courseId?: string; itemId?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderId, courseId, itemId } = await searchParams;

  if (!orderId) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("id, item_title, item_type, amount, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) redirect("/dashboard");

  const isCourse = order.item_type === "course";
  const course = isCourse && courseId ? getCourseById(courseId) : null;
  const product =
    !isCourse && itemId ? getProductById(itemId) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-black">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute h-24 w-24 animate-ping rounded-full bg-emerald-400/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            To&apos;lov muvaffaqiyatli!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-700 dark:text-gray-200">
              {order.item_title}
            </strong>{" "}
            {isCourse
              ? "uchun access muvaffaqiyatli ochildi"
              : "uchun buyurtma muvaffaqiyatli yaratildi"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-left dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Buyurtma #</span>
            <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
              {order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              To&apos;langan summa
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {((order.amount ?? 0) / 1000).toFixed(0)}K so&apos;m
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Holat</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle className="h-3 w-3" /> To&apos;langan
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-left dark:border-purple-900/30 dark:bg-purple-950/20">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
              Keyingi qadamlar
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-purple-700/80 dark:text-purple-400">
            <li className="flex items-center gap-2">
              <PlayCircle className="h-3.5 w-3.5 shrink-0" />
              {isCourse ? "Birinchi darsni boshlang" : "Mahsulotni shop orqali oching"}
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              {isCourse
                ? "AI Mentor sizni kuzatib boradi"
                : "Dashboard va resurslar bo'limi yangilanadi"}
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              {isCourse
                ? "Kursni tugating va sertifikat oling"
                : "Keyingi xaridlar uchun shop tavsiyalarini ko'ring"}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {course && (
            <Link
              href={`/courses/${course.id}/watch`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <PlayCircle className="h-4 w-4" /> Darsni boshlash
            </Link>
          )}
          {product && (
            <Link
              href="/shop"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <PlayCircle className="h-4 w-4" /> Marketplace&apos;ga qaytish
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
