"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Headphones, LifeBuoy, Send } from "lucide-react";

type SupportCategory =
  | "general"
  | "billing"
  | "receipt"
  | "technical"
  | "account"
  | "access"
  | "content";

interface SupportOrderOption {
  id: string;
  itemTitle: string;
  itemType: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface SupportRequestPanelProps {
  orders: SupportOrderOption[];
}

const categories: Array<{
  id: SupportCategory;
  label: string;
  description: string;
}> = [
  {
    id: "billing",
    label: "Billing",
    description: "To'lov, narx yoki checkout savollari",
  },
  {
    id: "receipt",
    label: "Receipt",
    description: "Chek yoki billing hujjati so'rovi",
  },
  {
    id: "access",
    label: "Access",
    description: "Kurs ochilmasligi yoki enrollment masalasi",
  },
  {
    id: "technical",
    label: "Texnik",
    description: "Platforma xatosi yoki ishlash muammosi",
  },
  {
    id: "account",
    label: "Account",
    description: "Profil, login yoki xavfsizlik savoli",
  },
  {
    id: "content",
    label: "Kontent",
    description: "Dars yoki material bilan bog'liq masala",
  },
  {
    id: "general",
    label: "Umumiy",
    description: "Boshqa barcha murojaatlar",
  },
];

export default function SupportRequestPanel({
  orders,
}: SupportRequestPanelProps) {
  const router = useRouter();
  const [category, setCategory] = useState<SupportCategory>("billing");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  async function handleSubmit() {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const trimmedSubject = subject.trim();
      const trimmedMessage = message.trim();

      if (trimmedSubject.length < 5) {
        throw new Error("Mavzu kamida 5 belgidan iborat bo'lsin.");
      }

      if (trimmedMessage.length < 20) {
        throw new Error("Murojaat tafsiloti kamida 20 belgidan iborat bo'lsin.");
      }

      const response = await fetch("/api/settings/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          orderId: selectedOrderId || null,
          subject: trimmedSubject,
          message: trimmedMessage,
          source: "billing_support",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Support so'rovi yuborilmadi.");
      }

      setSubject("");
      setMessage("");
      setSelectedOrderId("");
      setCategory("billing");
      setSaved(true);
      startTransition(() => {
        router.refresh();
      });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Support so'rovi yuborilmadi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="billing-support"
      className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <Headphones className="h-3.5 w-3.5" />
            Billing support
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
            Receipt yoki support so'rovi yuboring
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
            Billing, access yoki receipt bo'yicha savolni shu yerda qoldiring.
            Murojaat admin inbox va operations queue'ga tushadi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {saved ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {saving ? "Yuborilmoqda..." : saved ? "Yuborildi" : "Supportga yuborish"}
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Kategoriya
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as SupportCategory)}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
            >
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {categories.find((option) => option.id === category)?.description}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Buyurtma bilan bog'lash
            </label>
            <select
              value={selectedOrderId}
              onChange={(event) => setSelectedOrderId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
            >
              <option value="">Umumiy so'rov</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.itemTitle} | {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mavzu
            </label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Masalan: Receipt kerak yoki access ochilmadi"
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tafsilot
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              placeholder="Muammoni yoki so'rovni batafsil yozing. To'lov vaqti, usuli yoki kerakli receipt ma'lumotlarini kiriting."
              className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-gray-950">
              <LifeBuoy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-950 dark:text-white">
                Tanlangan kontekst
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Support jamoaga yuboriladigan qisqacha snapshot
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                Kategoriya
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                {categories.find((option) => option.id === category)?.label}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                Buyurtma
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                {selectedOrder
                  ? `${selectedOrder.itemTitle} | ${selectedOrder.status}`
                  : "Umumiy support so'rov"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                Tavsiya
              </p>
              <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
                Agar receipt kerak bo'lsa kompaniya rekvizitlari yoki to'lov tasdiq
                ma'lumotlarini matnda ko'rsating. Access muammosida esa kurs nomi va
                muammo qachon boshlanganini yozing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
