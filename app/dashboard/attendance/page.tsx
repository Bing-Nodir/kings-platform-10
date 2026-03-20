import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

function buildPattern(seed: string) {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => {
      const index = (row * 9 + col) % seed.length;
      return seed.charCodeAt(index) % 2 === 0;
    })
  );
}

export default async function AttendancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const seed = `${user.id}${user.email ?? ""}`;
  const pattern = buildPattern(seed);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-black md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard&apos;ga qaytish
        </Link>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-950 dark:text-white">
                QR attendance pass
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Markazga kelganda shu kartani ko&apos;rsating.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-black">
              <div className="grid grid-cols-9 gap-1">
                {pattern.flatMap((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`aspect-square rounded-[2px] ${
                        cell ? "bg-gray-950 dark:bg-white" : "bg-transparent"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/20">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Student
                </p>
                <p className="mt-2 text-lg font-bold text-gray-950 dark:text-white">
                  {user.email}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Session code
                </p>
                <p className="mt-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {user.id.slice(0, 8).toUpperCase()}-KINGS
                </p>
              </div>
              <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                Bu QR karta demo attendance pass hisoblanadi. Oflayn kampusda admin panel orqali skan qilinganda davomat qayd etiladi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
