import { FileText, ShieldCheck } from "lucide-react";
import {
  getSiteContent,
  getSiteContentEditorFields,
} from "@/lib/site-content";
import AdminContentEditor from "./AdminContentEditor";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  const fields = getSiteContentEditorFields(content);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sayt matnlarini boshqarish
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Admin sifatida navbar, homepage va footer copy'larini kodga kirmasdan
            yangilashingiz mumkin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
            <FileText className="h-3.5 w-3.5" />
            Live content editor
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Faqat admin uchun
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm leading-7 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
        Hozircha saytning eng ko'p ko'rinadigan marketing copy'lari editable
        qilindi. Shu struktura orqali keyingi sahifalardagi matnlarni ham
        bosqichma-bosqich admin panelga chiqarish juda oson bo'ladi.
      </div>

      <AdminContentEditor fields={fields} initialContent={content} />
    </div>
  );
}
