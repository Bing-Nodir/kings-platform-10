import { Plus, Trash2 } from "lucide-react";
import type { CourseSubmissionFormData } from "@/lib/course-submissions";
import { cloneForm, createEmptyReview } from "./submission-form-helpers";

export default function SubmissionReviewsSection({
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
          Student reviews
        </h2>
        <button
          type="button"
          onClick={() =>
            onFieldChange("reviews", [...formData.reviews, createEmptyReview()])
          }
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <Plus className="h-3.5 w-3.5" />
          Review
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {formData.reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Bu bo'lim ixtiyoriy. Agar feedback bo'lsa keyinroq ham qo'shishingiz mumkin.
          </div>
        ) : (
          formData.reviews.map((review, index) => (
            <div
              key={`review-${index}`}
              className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onFieldChange(
                      "reviews",
                      formData.reviews.filter(
                        (_, itemIndex) => itemIndex !== index
                      )
                    )
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={review.name}
                  onChange={(event) => {
                    const next = cloneForm(formData.reviews);
                    next[index].name = event.target.value;
                    onFieldChange("reviews", next);
                  }}
                  placeholder="Ism"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <input
                  value={review.role}
                  onChange={(event) => {
                    const next = cloneForm(formData.reviews);
                    next[index].role = event.target.value;
                    onFieldChange("reviews", next);
                  }}
                  placeholder="Role"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={review.rating}
                  onChange={(event) => {
                    const next = cloneForm(formData.reviews);
                    next[index].rating = Number.parseInt(
                      event.target.value || "5",
                      10
                    );
                    onFieldChange("reviews", next);
                  }}
                  placeholder="Reyting"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <textarea
                rows={4}
                value={review.quote}
                onChange={(event) => {
                  const next = cloneForm(formData.reviews);
                  next[index].quote = event.target.value;
                  onFieldChange("reviews", next);
                }}
                placeholder="Review matni"
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
