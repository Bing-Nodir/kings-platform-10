import { requireInstructorPage } from "@/lib/server/auth";
import { getInstructorWorkspaceData } from "@/lib/server/instructor-workspace";

function formatMoney(value: number | null | undefined) {
  return `${(value ?? 0).toLocaleString("uz-UZ")} so'm`;
}

export default async function InstructorFinancialPage() {
  const { supabase, user } = await requireInstructorPage({
    loginRedirect: "/login?redirect=/instructor/financial",
    fallbackRedirect: "/instructor",
  });
  const data = await getInstructorWorkspaceData(user.id, supabase);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-10 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-950">Financials</h1>
        <p className="mt-2 text-slate-600">
          Paid orders, estimated payout va payout history.
        </p>
      </div>

      <section className="mb-8 grid gap-5 md:grid-cols-3">
        {[
          { label: "Gross revenue", value: formatMoney(data.metrics.totalRevenue) },
          { label: "Estimated payout", value: formatMoney(data.metrics.estimatedPayout) },
          { label: "Paid orders", value: data.orders.length.toLocaleString("uz-UZ") },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-black text-slate-950">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-7 py-5">
            <h2 className="text-xl font-black text-slate-950">Recent Orders</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.orders.length === 0 ? (
              <div className="px-7 py-12 text-center text-sm text-slate-500">
                Hali paid order yo'q.
              </div>
            ) : (
              data.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 px-7 py-5">
                  <div>
                    <p className="font-black text-slate-950">
                      {order.item_title ?? order.item_id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{order.user_email}</p>
                  </div>
                  <p className="font-black text-emerald-900">
                    {formatMoney(order.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-7 py-5">
            <h2 className="text-xl font-black text-slate-950">Payout History</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.payouts.length === 0 ? (
              <div className="px-7 py-12 text-center text-sm text-slate-500">
                Hali payout batch yaratilmagan.
              </div>
            ) : (
              data.payouts.map((payout) => (
                <div key={payout.id} className="px-7 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-black text-slate-950">
                      {payout.period_start} - {payout.period_end}
                    </p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-600">
                      {payout.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-600">
                    <span>Gross: {formatMoney(payout.gross_revenue)}</span>
                    <span>Fee: {formatMoney(payout.platform_fee)}</span>
                    <span>Payout: {formatMoney(payout.payout_amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
