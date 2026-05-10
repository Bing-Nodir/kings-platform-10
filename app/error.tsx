"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-black">Modul tiklanish rejimida</h1>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Bitta route xato berdi, lekin platforma to'liq yiqilmasligi uchun
          recovery boundary ishga tushdi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black hover:bg-white/90"
        >
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </button>
      </section>
    </main>
  );
}
