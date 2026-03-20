import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, CheckCircle, Clock, DollarSign } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";

async function getOrders() {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("orders")
    .select(
      "id, user_email, item_title, item_type, amount, status, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  const { data: revenueData } = await supabase
    .from("orders")
    .select("amount")
    .eq("status", "paid");

  const totalRevenue = revenueData?.reduce((s, o) => s + (o.amount ?? 0), 0) ?? 0;

  return { orders: data ?? [], count: count ?? 0, totalRevenue };
}


export default async function AdminOrdersPage() {
  const { orders, count, totalRevenue } = await getOrders();

  const paid = orders.filter((o: { status: string }) => o.status === "paid").length;
  const pending = orders.filter((o: { status: string }) => o.status === "pending").length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buyurtmalar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Barcha to'lovlar va xaridlar tarixi
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Jami buyurtmalar", value: count, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "To'langan", value: paid, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Kutilmoqda", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { label: "Jami daromad", value: `${(totalRevenue / 1_000_000).toFixed(1)}M so'm`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <div className={`rounded-lg p-1.5 ${stat.bg}`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-900">
              <ShoppingBag className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Hali buyurtmalar yo'q
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/40">
                  {["#ID", "Foydalanuvchi", "Mahsulot", "Tur", "Summa", "Status", "Sana"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((order: {
                  id: string;
                  user_email: string;
                  item_title: string;
                  item_type: string;
                  amount: number;
                  status: string;
                  created_at: string;
                }) => {
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {order.user_email}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {order.item_title}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {order.item_type === "course" ? "Kurs" : "Mahsulot"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                        {((order.amount ?? 0) / 1000).toFixed(0)}K so'm
                      </td>
                      <td className="px-5 py-4">
                        <OrderStatusSelect
                          orderId={order.id}
                          currentStatus={order.status as "pending" | "paid" | "cancelled"}
                        />
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("uz-UZ", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
