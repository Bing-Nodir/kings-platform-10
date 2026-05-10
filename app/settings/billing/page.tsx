import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  GraduationCap,
  LifeBuoy,
  Receipt,
  Wallet,
} from "lucide-react";
import ReceiptDownloadButton from "@/components/settings/ReceiptDownloadButton";
import SupportRequestPanel from "@/components/settings/SupportRequestPanel";
import { getSubscriptionPlansData } from "@/lib/content-store";
import { requireAuthenticatedPage } from "@/lib/server/auth";
import {
  formatSupportCategoryLabel,
  formatSupportSourceLabel,
  getUserSupportTickets,
} from "@/lib/server/support";

function formatCurrency(amount: number) {
  return `${amount.toLocaleString("uz-UZ")} so'm`;
}

function formatPaymentMethod(method: string | null) {
  if (method === "card") return "Karta";
  if (method === "payme") return "Payme";
  if (method === "click") return "Click";
  return "Aniqlanmagan";
}

function formatStatusLabel(status: string) {
  if (status === "paid") return "To'langan";
  if (status === "cancelled") return "Bekor qilingan";
  return "Kutilmoqda";
}

function formatSupportStatusLabel(status: string) {
  if (status === "resolved") return "Yopilgan";
  if (status === "in_review") return "Ko'rib chiqilmoqda";
  return "Yangi";
}

function getSupportStatusClasses(status: string) {
  if (status === "resolved") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (status === "in_review") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
  }

  return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
}

export default async function SettingsBillingPage() {
  const { supabase, user } = await requireAuthenticatedPage(
    "/login?redirect=/settings/billing"
  );

  const [
    { data: orders },
    { count: enrollmentCount },
    plans,
    supportState,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, item_id, item_title, item_type, amount, status, payment_method, payment_reference, status_detail, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    getSubscriptionPlansData(),
    getUserSupportTickets(user.id, supabase),
  ]);

  const orderList = orders ?? [];
  const paidOrders = orderList.filter((order) => order.status === "paid");
  const totalSpent = paidOrders.reduce(
    (sum, order) => sum + (order.amount ?? 0),
    0
  );
  const paymentMethods = Array.from(
    new Set(
      paidOrders
        .map((order) => order.payment_method)
        .filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0
        )
    )
  );
  const supportTickets = supportState.tickets;
  const openSupportTickets = supportTickets.filter(
    (ticket) => ticket.status !== "resolved"
  ).length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_30%),linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] p-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_30%),linear-gradient(180deg,#020617_0%,#1f2937_100%)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Billing & access
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">
            To'lovlar, receipt va support oqimi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
            Billing tarixi, receipt yuklash va support ticketlar endi bitta professional
            workspace ichida boshqariladi.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Jami sarf
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Paid orders
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                    {paidOrders.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Faol access
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                    {enrollmentCount ?? 0} kurs
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/90">
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Ochiq ticketlar
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950 dark:text-white">
                    {openSupportTickets}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              Order history
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
              So'nggi buyurtmalar
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:text-gray-300">
            <CreditCard className="h-4 w-4" />
            {paymentMethods.length > 0
              ? paymentMethods
                  .map((method) => formatPaymentMethod(method))
                  .join(", ")
              : "Payment loglar kutilmoqda"}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {orderList.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-sm leading-7 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Hali buyurtmalar yo'q. Kurs yoki product checkout qilinganda
              billing tarixi shu yerda paydo bo'ladi.
            </div>
          ) : (
            orderList.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {order.item_title ?? "Noma'lum buyurtma"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {order.item_type === "product" ? "Product" : "Course"} |{" "}
                    {formatPaymentMethod(order.payment_method)} |{" "}
                    {new Date(order.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                  {order.payment_reference || order.status_detail ? (
                    <p className="mt-1 text-xs text-gray-400">
                      {order.payment_reference ?? order.status_detail}
                    </p>
                  ) : null}
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-bold text-gray-950 dark:text-white">
                    {formatCurrency(order.amount ?? 0)}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      order.status === "paid"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : order.status === "cancelled"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                    }`}
                  >
                    {formatStatusLabel(order.status)}
                  </span>
                  {order.status === "paid" ? (
                    <div className="mt-3 flex justify-start md:justify-end">
                      <ReceiptDownloadButton orderId={order.id} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SupportRequestPanel
          orders={orderList.map((order) => ({
            id: order.id,
            itemTitle: order.item_title ?? "Noma'lum buyurtma",
            itemType: order.item_type ?? "course",
            status: order.status ?? "pending",
            amount: order.amount ?? 0,
            createdAt: order.created_at,
          }))}
        />

        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Support overview
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
              Ticket snapshot
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {[
              {
                label: "Jami ticket",
                value: supportTickets.length,
              },
              {
                label: "Yopilgan",
                value: supportTickets.filter((ticket) => ticket.status === "resolved").length,
              },
              {
                label: "Ochiq",
                value: openSupportTickets,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            Receipt, billing yoki access bo'yicha ticket ochilganda admin inbox va
            operations panel bir vaqtda yangilanadi.
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Support history
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
              So'nggi support ticketlar
            </h2>
          </div>
          <a
            href="#billing-support"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            Yangi ticket
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {supportState.error ? (
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            {supportState.error} Supabase SQL Editor'da
            `supabase/migrations/20260321_settings_support_phase3.sql` ni ishga
            tushiring.
          </div>
        ) : supportTickets.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-sm leading-7 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            Hali support ticketlar yo'q. Receipt yoki billing bo'yicha savol
            bo'lsa yuqoridagi forma orqali murojaat qiling.
          </div>
        ) : (
          <div className="space-y-3">
            {supportTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {ticket.subject}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getSupportStatusClasses(ticket.status)}`}
                      >
                        {formatSupportStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                      <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 dark:border-gray-800 dark:bg-gray-950">
                        {formatSupportSourceLabel(ticket.source)}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 dark:border-gray-800 dark:bg-gray-950">
                        {formatSupportCategoryLabel(ticket.category)}
                      </span>
                      {ticket.relatedOrderTitle ? (
                        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 dark:border-gray-800 dark:bg-gray-950">
                          {ticket.relatedOrderTitle}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-500 dark:text-gray-400">
                      {ticket.message}
                    </p>
                    {ticket.resolutionNote ? (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                        {ticket.resolutionNote}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    <p>{new Date(ticket.createdAt).toLocaleString("uz-UZ")}</p>
                    {ticket.resolvedAt ? (
                      <p className="mt-1">
                        Yopilgan: {new Date(ticket.resolvedAt).toLocaleString("uz-UZ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Access models
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
            Mavjud planlar
          </h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <div className={`bg-gradient-to-br ${plan.accent} p-5 text-white`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {plan.name}
                </p>
                <p className="mt-3 text-2xl font-black">{plan.price}</p>
                <p className="mt-2 text-sm leading-7 text-white/85">
                  {plan.description}
                </p>
              </div>
              <div className="p-5">
                <Link
                  href={plan.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {plan.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
