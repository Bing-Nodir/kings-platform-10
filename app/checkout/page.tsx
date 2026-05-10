import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { GlassCheckoutCard } from "@/components/ui/glass-checkout-card";
import { getCourseByIdData, getProductByIdData } from "@/lib/content-store";
import {
  applyPricingPenalty,
  getStudentReputation,
} from "@/lib/server/student-reputation";
import { createClient } from "@/utils/supabase/server";

interface CheckoutPageProps {
  searchParams: Promise<{ type?: string; id?: string; error?: string }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { type, id, error } = await searchParams;
  const itemType = type === "product" ? "product" : "course";

  if (!id) {
    redirect(itemType === "product" ? "/shop" : "/courses");
  }

  const course = itemType === "course" ? await getCourseByIdData(id) : null;
  const product = itemType === "product" ? await getProductByIdData(id) : null;
  const item = course ?? product;

  if (!item) {
    redirect(itemType === "product" ? "/shop" : "/courses");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectTarget = `/checkout?type=${itemType}&id=${encodeURIComponent(item.id)}`;
    const params = new URLSearchParams({
      redirect: redirectTarget,
      message:
        itemType === "course"
          ? "Kursga yozilish uchun avval tizimga kiring."
          : "Xarid qilish uchun avval tizimga kiring.",
    });

    redirect(`/login?${params.toString()}`);
  }

  if (user && itemType === "course") {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", item.id)
      .maybeSingle();

    if (enrollment) {
      redirect(`/courses/${item.id}/watch`);
    }
  }

  const baseAmount = item.price;
  let checkoutAmount = baseAmount;
  let creditScore: number | null = null;
  let pricingPenaltyPercent = 0;

  if (user && itemType === "course") {
    const reputation = await getStudentReputation(user.id, supabase);
    creditScore = reputation.creditScore;
    pricingPenaltyPercent = reputation.pricingPenaltyPercent;
    checkoutAmount = applyPricingPenalty(baseAmount, pricingPenaltyPercent);
  }

  const itemTitle = course ? course.title : product!.name;
  const backHref = itemType === "course" ? `/courses/${item.id}` : "/shop";
  const bulletPoints =
    itemType === "course"
      ? [
          "Payment intent yaratiladi va provider tasdig'idan keyin access ochiladi",
          "Tasdiqlangan to'lovdan keyin dashboard va AI Mentor faol bo'ladi",
          "Enrollment endi faqat confirmed payment holatida beriladi",
        ]
      : [
          "Mahsulot uchun pending order va payment lifecycle yaratiladi",
          "Provider tasdiqlaganidan keyin billing tarixi yangilanadi",
          "Strong backend audit orqali payment holati kuzatiladi",
        ];
  const errorMessage =
    error === "missing_fields"
      ? "Iltimos, checkout maydonlarini to'liq to'ldiring."
      : error === "backend_setup_required"
        ? "Payment orchestration migrationlari hali ishga tushmagan. `supabase/migrations/20260321_payment_orchestration_phase3.sql` va avvalgi backend migrationlarni SQL Editor'da ishga tushiring."
        : error === "payment_intent_failed"
          ? "Buyurtma yaratildi, lekin payment intent tayyorlashda muammo bo'ldi. Iltimos, qayta urinib ko'ring."
          : error === "order_failed"
            ? "Buyurtmani saqlashda muammo yuz berdi. Iltimos, qayta urinib ko'ring."
            : null;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-gray-50/50 dark:bg-black">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto flex flex-1 flex-col px-4 py-8 md:px-8 md:py-12">
        <Link
          href={backHref}
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white md:mb-12"
        >
          <ArrowLeft className="h-4 w-4" /> Orqaga qaytish
        </Link>

        <div className="grid flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" /> Kafolatlangan checkout
            </div>

            {errorMessage ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
                Payment oqimini boshlang va access&apos;ni xavfsiz faollashtiring
              </h1>
              <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
                Kings Education ekotizimiga qo&apos;shilayotganingiz bilan tabriklaymiz. Endi checkout pending, confirmation va fulfillment bosqichlari bilan kuchliroq backend orqali yuradi.
              </p>
            </div>

            <div className="max-w-xl rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" /> Tanlangan mahsulot
              </div>
              <h2 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
                {itemTitle}
              </h2>
              <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
                {course ? course.subtitle : product!.description}
              </p>

              <div className="mt-6 grid gap-3">
                {bulletPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300"
                  >
                    {point}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-bold dark:border-gray-800">
                <span>Jami:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {checkoutAmount.toLocaleString()} UZS
                </span>
              </div>

              {pricingPenaltyPercent > 0 ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  Credit score {creditScore ?? 0}/100 bo'lgani uchun kurs
                  narxiga {pricingPenaltyPercent}% intizom penalty qo'shildi.
                  Asosiy narx: {baseAmount.toLocaleString()} UZS.
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <GlassCheckoutCard
              amount={checkoutAmount}
              itemId={item.id}
              itemType={itemType}
              itemTitle={itemTitle}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
