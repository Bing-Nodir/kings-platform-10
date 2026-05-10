"use client";

import { useState } from "react";
import { Check, Download, FileJson, ShieldCheck } from "lucide-react";

function resolveFileName(headerValue: string | null) {
  if (!headerValue) {
    return `kings-account-export-${new Date().toISOString().slice(0, 10)}.json`;
  }

  const match = headerValue.match(/filename="([^"]+)"/i);
  return match?.[1] ?? `kings-account-export-${new Date().toISOString().slice(0, 10)}.json`;
}

export default function AccountExportCard() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setDownloading(true);
    setDownloaded(false);
    setError("");

    try {
      const response = await fetch("/api/settings/export", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error ?? "Account exportni yuklab bo'lmadi.");
      }

      const blob = await response.blob();
      const fileName = resolveFileName(response.headers.get("content-disposition"));
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 2500);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Account exportni yuklab bo'lmadi."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section
      id="account-export"
      className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/30">
              <FileJson className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
                Account export
              </p>
              <h2 className="mt-1 text-2xl font-black text-gray-950 dark:text-white">
                Shaxsiy ma'lumotlar arxivi
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
            Profil, preferences, security audit, buyurtmalar va enrollmentlar
            bitta JSON faylga yig'iladi. Bu audit, backup yoki support bilan
            ishlashda foydali.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
              profile
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
              preferences
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
              security logs
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
              orders
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-800 dark:bg-gray-900">
              enrollments
            </span>
          </div>
        </div>

        <div className="lg:w-[280px]">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
          >
            {downloaded ? (
              <Check className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading
              ? "Yuklanmoqda..."
              : downloaded
                ? "Yuklab olindi"
                : "JSON exportni yuklash"}
          </button>

          <div className="mt-4 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <p>
                Export faqat login qilingan foydalanuvchi uchun yaratiladi va
                serverda no-store rejimida uzatiladi.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
