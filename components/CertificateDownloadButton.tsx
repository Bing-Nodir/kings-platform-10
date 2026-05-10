"use client";

import { Download } from "lucide-react";

export default function CertificateDownloadButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-800 print:hidden"
    >
      <Download className="h-4 w-4" />
      PDF qilib yuklab olish
    </button>
  );
}
