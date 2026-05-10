"use client";

import { useState } from "react";
import { Check, Download } from "lucide-react";

interface ReceiptDownloadButtonProps {
  orderId: string;
}

function resolveFileName(
  headerValue: string | null,
  orderId: string
) {
  if (!headerValue) {
    return `kings-receipt-${orderId.slice(0, 8)}.txt`;
  }

  const match = headerValue.match(/filename="([^"]+)"/i);
  return match?.[1] ?? `kings-receipt-${orderId.slice(0, 8)}.txt`;
}

export default function ReceiptDownloadButton({
  orderId,
}: ReceiptDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setLoading(true);
    setDone(false);
    setError("");

    try {
      const response = await fetch(`/api/settings/orders/${orderId}/receipt`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error ?? "Receiptni yuklab bo'lmadi.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = resolveFileName(
        response.headers.get("content-disposition"),
        orderId
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDone(true);
      window.setTimeout(() => setDone(false), 2200);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Receiptni yuklab bo'lmadi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-700 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
      >
        {done ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
        {loading ? "Yuklanmoqda..." : done ? "Yuklandi" : "Receipt"}
      </button>

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
