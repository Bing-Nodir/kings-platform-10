import { createClient } from "@/utils/supabase/server";
import { Mail, Search, UserCheck, UserX, Users, X } from "lucide-react";

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string }>;
}

type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  role: string;
  enrolledCourseCount: number;
};

async function getUsers(query?: string) {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, role")
    .order("created_at", { ascending: false });

  const { data: enrollments } = await supabase.from("enrollments").select("user_id");

  const enrollmentCountByUser = new Map<string, number>();
  for (const enrollment of enrollments ?? []) {
    const count = enrollmentCountByUser.get(enrollment.user_id) ?? 0;
    enrollmentCountByUser.set(enrollment.user_id, count + 1);
  }

  const users = ((profiles ?? []) as Omit<AdminUser, "enrolledCourseCount">[]).map(
    (profile) => ({
      ...profile,
      enrolledCourseCount: enrollmentCountByUser.get(profile.id) ?? 0,
    })
  );
  const normalizedQuery = query?.trim().toLowerCase();

  const filteredUsers = normalizedQuery
    ? users.filter((user) =>
        [user.full_name, user.email, user.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : users;

  return {
    users: filteredUsers,
    count: filteredUsers.length,
    totalCount: users.length,
  };
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { users, count, totalCount } = await getUsers(query);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Foydalanuvchilar
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {query
              ? `"${query}" bo'yicha ${count} ta foydalanuvchi topildi. Jami ${totalCount} ta profil mavjud.`
              : `Jami ${totalCount} ta ro'yxatdan o'tgan foydalanuvchi`}
          </p>
        </div>
        <form action="/admin/users" className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Ism, email yoki role bo'yicha qidiring"
            className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-20 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {query ? (
            <a
              href="/admin/users"
              className="absolute right-3 top-2 inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
              Tozalash
            </a>
          ) : null}
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-900">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {query ? "Mos foydalanuvchi topilmadi" : "Hali foydalanuvchilar yo'q"}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
              {query
                ? "Qidiruv iborasini o'zgartirib qayta urinib ko'ring"
                : "Ro'yxatdan o'tganlar bu yerda ko'rinadi"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/40">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Foydalanuvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Kurslar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ro'yxatdan o'tgan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Aloqa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.full_name ?? "Ism yo'q"}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {user.role ?? "student"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {user.enrolledCourseCount} ta kurs
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString("uz-UZ", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.email ? (
                        <a
                          href={`mailto:${user.email}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Email yo'q</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
