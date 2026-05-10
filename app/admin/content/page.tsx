import { DatabaseZap, FileText, ShieldCheck } from "lucide-react";
import {
  adminEditableSiteDocumentKinds,
  getSiteDocumentEditorRecords,
  getSiteDocumentKindLabel,
} from "@/lib/content-store";
import {
  getSiteContent,
  getSiteContentEditorFields,
} from "@/lib/site-content";
import { requireAdminPage } from "@/lib/server/auth";
import AdminContentEditor from "./AdminContentEditor";
import StructuredDocumentsEditor from "./StructuredDocumentsEditor";

export default async function AdminContentPage() {
  const [{ supabase }, content] = await Promise.all([
    requireAdminPage(),
    getSiteContent(),
  ]);
  const fields = getSiteContentEditorFields(content);

  const { data: structuredRows, error: structuredError } = await supabase
    .from("site_documents")
    .select("kind, slug, title, status, sort_order, payload, metadata, updated_at")
    .in("kind", [...adminEditableSiteDocumentKinds])
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });

  const structuredDocuments = getSiteDocumentEditorRecords(
    structuredError ? null : structuredRows,
    adminEditableSiteDocumentKinds
  );
  const structuredDocumentsForEditor = structuredDocuments.map((document) => ({
    ...document,
    payload:
      document.payload &&
      typeof document.payload === "object" &&
      !Array.isArray(document.payload)
        ? (document.payload as Record<string, unknown>)
        : {},
    metadata:
      document.metadata &&
      typeof document.metadata === "object" &&
      !Array.isArray(document.metadata)
        ? document.metadata
        : {},
  }));
  const kindLabels = Object.fromEntries(
    adminEditableSiteDocumentKinds.map((kind) => [kind, getSiteDocumentKindLabel(kind)])
  );

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sayt matnlari va structured content
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Admin sifatida marketing copy, FAQ, business bloklari, homepage
            statlari va boshqa public kontentni kodga kirmasdan boshqarishingiz mumkin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
            <FileText className="h-3.5 w-3.5" />
            Live content editor
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300">
            <DatabaseZap className="h-3.5 w-3.5" />
            DB-backed blocks
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Faqat admin uchun
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm leading-7 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
        Public sahifalardagi asosiy bloklar endi `site_content` va `site_documents`
        orqali boshqariladi. Save qilinganda cache invalidation ishlaydi, shuning
        uchun public sahifalar yangi kontentni tezda ko'ra boshlaydi.
        {structuredError ? (
          <span className="mt-2 block text-sm text-amber-600 dark:text-amber-300">
            Structured documents DB query xato berdi:{" "}
            {structuredError.code === "42P01"
              ? "20260321_site_documents_foundation.sql migration'ni SQL Editor orqali ishga tushiring."
              : structuredError.message}
          </span>
        ) : null}
      </div>

      <AdminContentEditor fields={fields} initialContent={content} />
      <StructuredDocumentsEditor
        documents={structuredDocumentsForEditor}
        kindLabels={kindLabels}
      />
    </div>
  );
}
