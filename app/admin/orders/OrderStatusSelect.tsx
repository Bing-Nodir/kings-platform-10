"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "pending", label: "Kutilmoqda" },
  { value: "paid", label: "To'langan" },
  { value: "cancelled", label: "Bekor qilingan" },
] as const;

type Status = "pending" | "paid" | "cancelled";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: Status;
}

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const colorMap: Record<Status, string> = {
    paid: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40",
    pending:
      "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
    cancelled:
      "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40",
  };

  function handleChange(event: { target: { value: string } }) {
    const newStatus = event.target.value as Status;
    if (newStatus === currentStatus) return;
    startTransition(() => {
      updateOrderStatus(orderId, newStatus);
    });
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition disabled:opacity-50 ${colorMap[currentStatus]}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
