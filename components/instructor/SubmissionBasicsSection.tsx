import type { CourseSubmissionFormData } from "@/lib/course-submissions";

export default function SubmissionBasicsSection({
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
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        Asosiy ma&apos;lumotlar
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          ["title", "Kurs nomi"],
          ["slug", "Slug / URL id"],
          ["subtitle", "Qisqa subtitle"],
          ["category", "Kategoriya"],
          ["duration", "Davomiylik"],
          ["pace", "Pace"],
          ["level", "Daraja"],
          ["heroGradient", "Hero gradient class"],
          ["cardImage", "Card image URL"],
        ].map(([key, label]) => (
          <label key={key} className="space-y-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {label}
            </span>
            <input
              value={String(formData[key as keyof CourseSubmissionFormData] ?? "")}
              onChange={(event) =>
                onFieldChange(
                  key as keyof CourseSubmissionFormData,
                  event.target.value as never
                )
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </label>
        ))}

        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Til
          </span>
          <select
            value={formData.language}
            onChange={(event) =>
              onFieldChange("language", event.target.value as "uz" | "ru" | "en")
            }
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="uz">Uzbek</option>
            <option value="ru">Russian</option>
            <option value="en">English</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Narx
          </span>
          <input
            type="number"
            min={0}
            value={formData.price}
            onChange={(event) =>
              onFieldChange("price", Number.parseInt(event.target.value || "0", 10))
            }
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </label>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Kurs tavsifi
        </span>
        <textarea
          rows={6}
          value={formData.description}
          onChange={(event) => onFieldChange("description", event.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
        />
      </label>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-emerald-900 dark:text-emerald-200">
          Kurs certificate template
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ["title", "Certificate title"],
            ["organizationName", "Organization"],
            ["signatureName", "Signature name"],
            ["signatureTitle", "Signature title"],
            ["accentColor", "Accent color"],
            ["sealText", "Seal text"],
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {label}
              </span>
              <input
                value={String(
                  formData.certificateTemplate[
                    key as keyof CourseSubmissionFormData["certificateTemplate"]
                  ] ?? ""
                )}
                onChange={(event) =>
                  onFieldChange("certificateTemplate", {
                    ...formData.certificateTemplate,
                    [key]: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-500 dark:border-emerald-900/40 dark:bg-gray-950 dark:text-white"
              />
            </label>
          ))}
        </div>
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Certificate body
          </span>
          <textarea
            rows={3}
            value={formData.certificateTemplate.certificateBody}
            onChange={(event) =>
              onFieldChange("certificateTemplate", {
                ...formData.certificateTemplate,
                certificateBody: event.target.value,
              })
            }
            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-500 dark:border-emerald-900/40 dark:bg-gray-950 dark:text-white"
          />
        </label>
      </div>
    </section>
  );
}
