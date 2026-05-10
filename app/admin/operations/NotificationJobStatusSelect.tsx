"use client";

import { useTransition } from "react";
import { updateNotificationJobStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "queued", label: "Navbatda" },
  { value: "processing", label: "Jarayonda" },
  { value: "sent", label: "Yuborilgan" },
  { value: "failed", label: "Xato" },
  { value: "cancelled", label: "Bekor" },
] as const;

type Status = (typeof STATUS_OPTIONS)[number]["value"];

interface NotificationJobStatusSelectProps {
  jobId: string;
  currentStatus: Status;
}

export default function NotificationJobStatusSelect({
  jobId,
  currentStatus,
}: NotificationJobStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const colorMap: Record<Status, string> = {
    queued:
      "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40",
    processing:
      "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
    sent: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40",
    failed:
      "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40",
    cancelled:
      "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
  };

  function handleChange(event: { target: { value: string } }) {
    const nextStatus = event.target.value as Status;
    if (nextStatus === currentStatus) return;

    startTransition(() => {
      updateNotificationJobStatus(jobId, nextStatus);
    });
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition disabled:opacity-50 ${colorMap[currentStatus]}`}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
