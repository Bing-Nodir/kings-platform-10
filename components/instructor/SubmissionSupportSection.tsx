import { Plus, Trash2 } from "lucide-react";
import type { CourseSubmissionFormData } from "@/lib/course-submissions";
import {
  cloneForm,
  createEmptySupportItem,
} from "./submission-form-helpers";

export default function SubmissionSupportSection({
  formData,
  onFieldChange,
}: {
  formData: CourseSubmissionFormData;
  onFieldChange: <K extends keyof CourseSubmissionFormData>(
    key: K,
    value: CourseSubmissionFormData[K]
  ) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Natijalar va support
        </h2>
        <button
          type="button"
          onClick={() => onFieldChange("outcomes", [...formData.outcomes, ""])}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <Plus className="h-3.5 w-3.5" />
          Outcome
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {formData.outcomes.map((outcome, index) => (
          <div key={`outcome-${index}`} className="flex gap-3">
            <input
              value={outcome}
              onChange={(event) => {
                const next = [...formData.outcomes];
                next[index] = event.target.value;
                onFieldChange("outcomes", next);
              }}
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              placeholder="Kurs yakunidagi outcome"
            />
            <button
              type="button"
              onClick={() =>
                onFieldChange(
                  "outcomes",
                  formData.outcomes.filter((_, itemIndex) => itemIndex !== index)
                )
              }
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          Support items
        </h3>
        <button
          type="button"
          onClick={() =>
            onFieldChange("supportItems", [
              ...formData.supportItems,
              createEmptySupportItem(),
            ])
          }
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <Plus className="h-3.5 w-3.5" />
          Support item
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {formData.supportItems.map((item, index) => (
          <div
            key={`support-${index}`}
            className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  onFieldChange(
                    "supportItems",
                    formData.supportItems.filter(
                      (_, itemIndex) => itemIndex !== index
                    )
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={item.title}
                onChange={(event) => {
                  const next = cloneForm(formData.supportItems);
                  next[index].title = event.target.value;
                  onFieldChange("supportItems", next);
                }}
                placeholder="Support sarlavha"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              <textarea
                rows={4}
                value={item.description}
                onChange={(event) => {
                  const next = cloneForm(formData.supportItems);
                  next[index].description = event.target.value;
                  onFieldChange("supportItems", next);
                }}
                placeholder="Support tavsifi"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
