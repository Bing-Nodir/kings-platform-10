import { courses } from "@/lib/catalog";
import { getAdminOverviewData } from "@/lib/server/metrics";
import {
  Users,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Activity,
  DollarSign,
  Star,
} from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getAdminOverviewData();

  const summaryCards = [
    {
      label: "Jami foydalanuvchilar",
      value: stats.userCount.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      change: "+12%",
    },
    {
      label: "Aktiv kurslar",
      value: courses.length.toString(),
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      change: "+3",
    },
    {
      label: "Jami buyurtmalar",
      value: stats.orderCount.toLocaleString(),
      icon: ShoppingBag,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      change: "+8%",
    },
    {
      label: "Jami daromad",
      value: `${(stats.totalRevenue / 1_000_000).toFixed(1)}M so'm`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      change: "+24%",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bosh panel
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kings Education platformasi umumiy ko'rinishi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-xl p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {card.change} o'tgan oyga nisbatan
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Recent Orders + Recent Users + Courses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              So'nggi buyurtmalar
            </h2>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {stats.recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
                Hozircha buyurtmalar yo'q
              </div>
            ) : (
              stats.recentOrders.map((order: {
                id: string;
                amount: number;
                status: string;
                created_at: string;
                user_email: string;
                item_title: string;
              }) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.item_title ?? "Noma'lum"}
                    </p>
                    <p className="text-xs text-gray-400">{order.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {((order.amount ?? 0) / 1000).toFixed(0)}K so'm
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        order.status === "paid"
                          ? "text-emerald-600"
                          : "text-amber-500"
                      }`}
                    >
                      {order.status === "paid" ? "To'langan" : "Kutilmoqda"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Recent Users */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Yangi a'zolar
              </h2>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recentUsers.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                  Hali ro'yxatdan o'tganlar yo'q
                </div>
              ) : (
                stats.recentUsers.map((user: {
                  id: string;
                  full_name: string;
                  email: string;
                  created_at: string;
                }) => (
                  <div key={user.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name ?? "Ism yo'q"}
                      </p>
                      <p className="truncate text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Eng yaxshi kurslar
              </h2>
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {course.students.toLocaleString()} o'quvchi
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                    {course.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
