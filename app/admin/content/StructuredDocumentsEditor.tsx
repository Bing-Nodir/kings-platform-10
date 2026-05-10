"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DatabaseZap, Loader2, RefreshCcw, Save } from "lucide-react";

interface StructuredDocumentRecord {
  kind: string;
  slug: string;
  title: string | null;
  status: "draft" | "published" | "archived";
  sort_order: number | null;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  updated_at?: string | null;
  source: "database" | "seed";
}

interface EditableStructuredDocument extends StructuredDocumentRecord {
  payloadText: string;
}

function toEditableDocuments(documents: StructuredDocumentRecord[]) {
  return documents.map((document) => ({
    ...document,
    payloadText: JSON.stringify(document.payload, null, 2),
  }));
}

export default function StructuredDocumentsEditor({
  documents,
  kindLabels,
}: {
  documents: StructuredDocumentRecord[];
  kindLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [editableDocuments, setEditableDocuments] = useState<EditableStructuredDocument[]>(
    () => toEditableDocuments(documents)
  );
  const [status, setStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setEditableDocuments(toEditableDocuments(documents));
  }, [documents]);

  const groupedDocuments = useMemo(() => {
    const map = new Map<string, EditableStructuredDocument[]>();

    for (const document of editableDocuments) {
      if (!map.has(document.kind)) {
        map.set(document.kind, []);
      }

      map.get(document.kind)!.push(document);
    }

    return [...map.entries()];
  }, [editableDocuments]);

  function updateDocument(
    targetKind: string,
    targetSlug: string,
    updater: (document: EditableStructuredDocument) => EditableStructuredDocument
  ) {
    setEditableDocuments((current) =>
      current.map((document) =>
        document.kind === targetKind && document.slug === targetSlug
          ? updater(document)
          : document
      )
    );
    setStatus({ tone: "idle", message: "" });
  }

  function resetForm() {
    setEditableDocuments(toEditableDocuments(documents));
    setStatus({
      tone: "idle",
      message: "Structured content oxirgi saqlangan holatga qaytarildi.",
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const parsedDocuments = editableDocuments.map((document) => {
          const parsedPayload = JSON.parse(document.payloadText) as unknown;

          if (
            !parsedPayload ||
            typeof parsedPayload !== "object" ||
            Array.isArray(parsedPayload)
          ) {
            throw new Error(
              `${document.slug} uchun payload JSON obyekt bo'lishi kerak.`
            );
          }

          return {
            kind: document.kind,
            slug: document.slug,
            title: document.title,
            status: document.status,
            sort_order: document.sort_order ?? 0,
            payload: parsedPayload,
            metadata: document.metadata ?? {},
          };
        });

        const response = await fetch("/api/admin/site-documents", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documents: parsedDocuments }),
        });

        const result = (await response.json().catch(() => null)) as
          | { error?: string; documents?: StructuredDocumentRecord[] }
          | null;

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Structured content saqlash paytida xatolik yuz berdi."
          );
        }

        setEditableDocuments(toEditableDocuments(result?.documents ?? documents));
        setStatus({
          tone: "success",
          message:
            "Structured content saqlandi. Public sahifalar cache'i yangilandi.",
        });
        router.refresh();
      } catch (error) {
        setStatus({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Structured content saqlashda noma'lum xatolik yuz berdi.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Structured documents
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Homepage stats, ecosystem kartalari, FAQ, business va about bloklari
            endi DB orqali boshqariladi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <RefreshCcw className="h-4 w-4" />
            Qaytarish
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? "Saqlanmoqda..." : "Structured contentni saqlash"}
          </button>
        </div>
      </div>

      {status.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            status.tone === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
              : status.tone === "error"
                ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                : "border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div className="space-y-8">
        {groupedDocuments.map(([kind, items]) => (
          <section
            key={kind}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {kindLabels[kind] ?? kind}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Shu turdagi public komponentlar uchun structured data shu yerda saqlanadi.
              </p>
            </div>

            <div className="space-y-6 px-6 py-5">
              {items.map((document) => (
                <article
                  key={`${document.kind}:${document.slug}`}
                  className="rounded-[1.75rem] border border-gray-100 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-black/30"
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                          {document.slug}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            document.source === "database"
                              ? "border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                              : "border border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
                          }`}
                        >
                          {document.source === "database" ? "DB" : "Seed"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Oxirgi update: {document.updated_at ?? "seed fallback"}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300">
                      <DatabaseZap className="h-3.5 w-3.5" />
                      Live cache invalidation
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_140px_120px]">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        Title
                      </span>
                      <input
                        type="text"
                        value={document.title ?? ""}
                        onChange={(event) =>
                          updateDocument(document.kind, document.slug, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <select
                        value={document.status}
                        onChange={(event) =>
                          updateDocument(document.kind, document.slug, (current) => ({
                            ...current,
                            status: event.target.value as StructuredDocumentRecord["status"],
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      >
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                        <option value="archived">archived</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        Sort
                      </span>
                      <input
                        type="number"
                        value={document.sort_order ?? 0}
                        onChange={(event) =>
                          updateDocument(document.kind, document.slug, (current) => ({
                            ...current,
                            sort_order: Number(event.target.value) || 0,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                      Payload JSON
                    </span>
                    <textarea
                      rows={10}
                      spellCheck={false}
                      value={document.payloadText}
                      onChange={(event) =>
                        updateDocument(document.kind, document.slug, (current) => ({
                          ...current,
                          payloadText: event.target.value,
                        }))
                      }
                      className="min-h-56 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-mono text-xs text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </label>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </form>
  );
}
