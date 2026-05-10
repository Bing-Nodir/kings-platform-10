import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  LayoutDashboard,
  LoaderCircle,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCourseByIdData, getProductByIdData } from "@/lib/content-store";
import SandboxPaymentConfirmButton from "@/components/payments/SandboxPaymentConfirmButton";
import {
  formatOrderStatusLabel,
  formatPaymentIntentStatusLabel,
  getOrderPaymentView,
  isSandboxPaymentConfirmationEnabled,
} from "@/lib/server/payments";
import { createClient } from "@/utils/supabase/server";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string; paymentIntentId?: string; itemId?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderId, paymentIntentId, itemId } = await searchParams;

  if (!orderId) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const paymentView = await getOrderPaymentView(orderId, user.id, supabase);

  if (!paymentView) redirect("/dashboard");

  const { order, paymentIntent } = paymentView;
  const isCourse = order.item_type === "course";
  const [course, product] = await Promise.all([
    isCourse && order.item_id ? getCourseByIdData(order.item_id) : Promise.resolve(null),
    !isCourse && itemId ? getProductByIdData(itemId) : Promise.resolve(null),
  ]);
  const isPaid = order.status === "paid";
  const sandboxEnabled = isSandboxPaymentConfirmationEnabled();
  const showSandboxConfirm =
    sandboxEnabled &&
    order.status === "pending" &&
    paymentIntent?.id === paymentIntentId;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-black">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div
            className={`absolute h-24 w-24 animate-ping rounded-full ${
              isPaid ? "bg-emerald-400/20" : "bg-amber-400/20"
            }`}
          />
          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
              isPaid
                ? "bg-emerald-100 dark:bg-emerald-950/40"
                : "bg-amber-100 dark:bg-amber-950/40"
            }`}
          >
            {isPaid ? (
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <LoaderCircle className="h-10 w-10 animate-spin text-amber-600 dark:text-amber-300" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {isPaid ? "To'lov muvaffaqiyatli!" : "To'lov tasdig'i kutilmoqda"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-700 dark:text-gray-200">
              {order.item_title}
            </strong>{" "}
            {isPaid
              ? isCourse
                ? "uchun access muvaffaqiyatli ochildi"
                : "uchun buyurtma muvaffaqiyatli yaratildi"
              : "uchun payment lifecycle yaratildi va provider tasdig'i kutilmoqda"}
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
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : order.status === "cancelled"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              }`}
            >
              <CheckCircle className="h-3 w-3" /> {formatOrderStatusLabel(order.status)}
            </span>
          </div>
          {paymentIntent ? (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Payment intent</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPaymentIntentStatusLabel(paymentIntent.status)}
              </span>
            </div>
          ) : null}
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
              {isPaid
                ? isCourse
                  ? "Birinchi darsni boshlang"
                  : "Mahsulotni shop orqali oching"
                : "Provider tasdig'i yoki webhook callbackni kuting"}
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              {isPaid
                ? isCourse
                  ? "AI Mentor sizni kuzatib boradi"
                  : "Dashboard va resurslar bo'limi yangilanadi"
                : "Tasdiqlangach access va billing tarixi avtomatik yangilanadi"}
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              {isPaid
                ? isCourse
                  ? "Kursni tugating va sertifikat oling"
                  : "Keyingi xaridlar uchun shop tavsiyalarini ko'ring"
                : "Admin panel va webhook loglarida holat kuzatiladi"}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isPaid && course && (
            <Link
              href={`/courses/${course.id}/watch`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <PlayCircle className="h-4 w-4" /> Darsni boshlash
            </Link>
          )}
          {isPaid && product && (
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

        {showSandboxConfirm && paymentIntent ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <p className="mb-3 text-sm leading-7 text-emerald-800 dark:text-emerald-200">
              Sandbox rejimida payment confirmationni shu yerning o'zidan sinab ko'rish mumkin. Productionda bu bosqich webhook yoki real gateway callback bilan almashtiriladi.
            </p>
            <SandboxPaymentConfirmButton
              orderId={order.id}
              paymentIntentId={paymentIntent.id}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
