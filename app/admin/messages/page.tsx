import { Mail, MessageSquare, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { updateMessageStatus } from "./actions";

interface AdminMessagesPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_review" | "resolved";
  created_at: string;
};

async function getMessages(query?: string, status?: string) {
  const supabase = await createClient();
  let request = supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    request = request.eq("status", status);
  }

  const { data, error } = await request;

  if (error) {
    return {
      messages: [] as ContactMessage[],
      error: error.message,
    };
  }

  const normalizedQuery = query?.trim().toLowerCase();
  const messages = ((data ?? []) as ContactMessage[]).filter((item) =>
    normalizedQuery
      ? [item.name, item.email, item.subject, item.message]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true
  );

  return { messages, error: null as string | null };
}

const statusMeta = {
  new: {
    label: "Yangi",
    classes:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  },
  in_review: {
    label: "Ko'rib chiqilmoqda",
    classes:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  },
  resolved: {
    label: "Yopilgan",
    classes:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
} as const;

export default async function AdminMessagesPage({
  searchParams,
}: AdminMessagesPageProps) {
  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";
  const currentStatus = status?.trim() || "all";
  const { messages, error } = await getMessages(query, currentStatus);

  const counts = {
    total: messages.length,
    new: messages.filter((message) => message.status === "new").length,
    inReview: messages.filter((message) => message.status === "in_review").length,
    resolved: messages.filter((message) => message.status === "resolved").length,
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Murojaatlar
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Saytdan yuborilgan contact form xabarlari
          </p>
        </div>

        <form action="/admin/messages" className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Ism, email yoki mavzu bo'yicha qidiring"
              className="h-9 w-full rounded-full border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <select
            name="status"
            defaultValue={currentStatus}
            className="h-9 rounded-full border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="all">Barcha status</option>
            <option value="new">Yangi</option>
            <option value="in_review">Ko'rib chiqilmoqda</option>
            <option value="resolved">Yopilgan</option>
          </select>
        </form>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          `contact_messages` jadvali hali bazada yo'q yoki policy yetishmayapti. Supabase SQL Editor'da
          `supabase/migrations/20260318_backend_repair.sql` migratsiyasini ishga tushiring.
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Jami", value: counts.total },
              { label: "Yangi", value: counts.new },
              { label: "Ko'rib chiqilmoqda", value: counts.inReview },
              { label: "Yopilgan", value: counts.resolved },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <MessageSquare className="mb-3 h-7 w-7 text-gray-300 dark:text-gray-700" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Hozircha murojaatlar topilmadi
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const meta = statusMeta[message.status] ?? statusMeta.new;

                return (
                  <article
                    key={message.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {message.subject}
                          </h2>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{message.name}</span>
                          <span>|</span>
                          <a
                            href={`mailto:${message.email}`}
                            className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {message.email}
                          </a>
                          <span>|</span>
                          <span>
                            {new Date(message.created_at).toLocaleDateString("uz-UZ", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">
                          {message.message}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {message.status !== "new" && (
                          <form action={updateMessageStatus}>
                            <input type="hidden" name="id" value={message.id} />
                            <input type="hidden" name="status" value="new" />
                            <button
                              type="submit"
                              className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
                            >
                              Yangi
                            </button>
                          </form>
                        )}
                        {message.status !== "in_review" && (
                          <form action={updateMessageStatus}>
                            <input type="hidden" name="id" value={message.id} />
                            <input type="hidden" name="status" value="in_review" />
                            <button
                              type="submit"
                              className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-amber-200 hover:text-amber-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-amber-500/40 dark:hover:text-amber-300"
                            >
                              Ko'rib chiqish
                            </button>
                          </form>
                        )}
                        {message.status !== "resolved" && (
                          <form action={updateMessageStatus}>
                            <input type="hidden" name="id" value={message.id} />
                            <input type="hidden" name="status" value="resolved" />
                            <button
                              type="submit"
                              className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                            >
                              Yopish
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

