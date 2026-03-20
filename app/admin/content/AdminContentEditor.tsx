"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw, Save } from "lucide-react";

type SiteContentSection =
  | "Navbar"
  | "Home Hero"
  | "Home Courses"
  | "Home Ecosystem"
  | "Footer";

interface SiteContentEditorField {
  id: string;
  label: string;
  description: string;
  section: SiteContentSection;
  multiline: boolean;
  maxLength: number;
  value: string;
}

type SiteContentMap = Record<string, string>;

const siteContentSections: SiteContentSection[] = [
  "Navbar",
  "Home Hero",
  "Home Courses",
  "Home Ecosystem",
  "Footer",
];

export default function AdminContentEditor({
  fields,
  initialContent,
}: {
  fields: SiteContentEditorField[];
  initialContent: SiteContentMap;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<SiteContentMap>(initialContent);
  const [status, setStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFormData(initialContent);
  }, [initialContent]);

  const groupedFields = useMemo(
    () =>
      siteContentSections
        .map((section) => ({
          section,
          fields: fields.filter((field) => field.section === section),
        }))
        .filter((sectionGroup) => sectionGroup.fields.length > 0),
    [fields]
  );

  function updateField(id: string, value: string) {
    setFormData((current) => ({
      ...current,
      [id]: value,
    }));
    setStatus({ tone: "idle", message: "" });
  }

  function resetForm() {
    setFormData(initialContent);
    setStatus({
      tone: "idle",
      message: "O'zgartirishlar oxirgi saqlangan holatga qaytarildi.",
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/content", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: formData }),
        });

        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            result?.error || "Matnlarni saqlash paytida xatolik yuz berdi."
          );
        }

        setStatus({
          tone: "success",
          message: "Matnlar saqlandi. Saytning public sahifalari yangilandi.",
        });
        router.refresh();
      } catch (error) {
        setStatus({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Saqlashda noma'lum xatolik yuz berdi.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sayt matnlarini boshqarish
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Admin paneldan home, navbar va footer copy'larini xavfsiz tahrirlab,
            bir tugma bilan public sahifalarga chiqarishingiz mumkin.
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
            {isPending ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
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

      <div className="grid gap-6 xl:grid-cols-2">
        {groupedFields.map((sectionGroup) => (
          <section
            key={sectionGroup.section}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {sectionGroup.section}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ushbu bo'limga tegishli public matnlar shu yerda saqlanadi.
              </p>
            </div>

            <div className="space-y-5 px-6 py-5">
              {sectionGroup.fields.map((field) => {
                const value = formData[field.id] ?? "";
                const commonProps = {
                  id: field.id,
                  name: field.id,
                  maxLength: field.maxLength,
                  value,
                  onChange: (
                    event: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >
                  ) => updateField(field.id, event.target.value),
                  className:
                    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white",
                };

                return (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <label
                          htmlFor={field.id}
                          className="text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          {field.label}
                        </label>
                        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                          {field.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
                        {value.length}/{field.maxLength}
                      </span>
                    </div>

                    {field.multiline ? (
                      <textarea
                        {...commonProps}
                        rows={4}
                        spellCheck={false}
                        className={`${commonProps.className} min-h-28 resize-y`}
                      />
                    ) : (
                      <input {...commonProps} type="text" spellCheck={false} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </form>
  );
}
