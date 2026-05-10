import { Plus, Trash2 } from "lucide-react";
import type { CourseSubmissionFormData } from "@/lib/course-submissions";
import {
  cloneForm,
  createEmptyLesson,
  createEmptyModule,
  createEmptyResource,
} from "./submission-form-helpers";

export default function SubmissionModulesSection({
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
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Modullar, darslar va materiallar
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Har bir lesson uchun video link va resource link kiritish mumkin.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onFieldChange("modules", [
              ...formData.modules,
              createEmptyModule(formData.modules.length),
            ])
          }
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Modul qo'shish
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {formData.modules.map((module, moduleIndex) => (
          <div
            key={`module-${moduleIndex}`}
            className="rounded-[1.75rem] border border-gray-200 p-5 dark:border-gray-800"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid flex-1 gap-3 md:grid-cols-2">
                <input
                  value={module.id}
                  onChange={(event) => {
                    const next = cloneForm(formData.modules);
                    next[moduleIndex].id = event.target.value;
                    onFieldChange("modules", next);
                  }}
                  placeholder="module-1"
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <input
                  value={module.title}
                  onChange={(event) => {
                    const next = cloneForm(formData.modules);
                    next[moduleIndex].title = event.target.value;
                    onFieldChange("modules", next);
                  }}
                  placeholder="Modul nomi"
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onFieldChange(
                    "modules",
                    formData.modules.filter(
                      (_, itemIndex) => itemIndex !== moduleIndex
                    )
                  )
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={module.description}
              onChange={(event) => {
                const next = cloneForm(formData.modules);
                next[moduleIndex].description = event.target.value;
                onFieldChange("modules", next);
              }}
              placeholder="Modul tavsifi"
              className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />

            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                Lessons
              </h3>
              <button
                type="button"
                onClick={() => {
                  const next = cloneForm(formData.modules);
                  next[moduleIndex].lessons.push(
                    createEmptyLesson(next[moduleIndex].lessons.length)
                  );
                  onFieldChange("modules", next);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Lesson
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {module.lessons.map((lesson, lessonIndex) => (
                <div
                  key={`lesson-${moduleIndex}-${lessonIndex}`}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <input
                      value={lesson.id}
                      onChange={(event) => {
                        const next = cloneForm(formData.modules);
                        next[moduleIndex].lessons[lessonIndex].id =
                          event.target.value;
                        onFieldChange("modules", next);
                      }}
                      placeholder="lesson-1"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                    <input
                      value={lesson.title}
                      onChange={(event) => {
                        const next = cloneForm(formData.modules);
                        next[moduleIndex].lessons[lessonIndex].title =
                          event.target.value;
                        onFieldChange("modules", next);
                      }}
                      placeholder="Dars nomi"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                    <input
                      value={lesson.duration}
                      onChange={(event) => {
                        const next = cloneForm(formData.modules);
                        next[moduleIndex].lessons[lessonIndex].duration =
                          event.target.value;
                        onFieldChange("modules", next);
                      }}
                      placeholder="12:30"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Preview
                      </label>
                      <input
                        type="checkbox"
                        checked={lesson.isFree}
                        onChange={(event) => {
                          const next = cloneForm(formData.modules);
                          next[moduleIndex].lessons[lessonIndex].isFree =
                            event.target.checked;
                          onFieldChange("modules", next);
                        }}
                      />
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={lesson.summary}
                    onChange={(event) => {
                      const next = cloneForm(formData.modules);
                      next[moduleIndex].lessons[lessonIndex].summary =
                        event.target.value;
                      onFieldChange("modules", next);
                    }}
                    placeholder="Dars summary"
                    className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                      value={lesson.videoUrl}
                      onChange={(event) => {
                        const next = cloneForm(formData.modules);
                        next[moduleIndex].lessons[lessonIndex].videoUrl =
                          event.target.value;
                        onFieldChange("modules", next);
                      }}
                      placeholder="Video URL yoki storage link"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                    <input
                      value={lesson.videoMimeType}
                      onChange={(event) => {
                        const next = cloneForm(formData.modules);
                        next[moduleIndex].lessons[lessonIndex].videoMimeType =
                          event.target.value;
                        onFieldChange("modules", next);
                      }}
                      placeholder="video/mp4"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      Resurslar
                    </h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = cloneForm(formData.modules);
                          next[moduleIndex].lessons[lessonIndex].resources.push(
                            createEmptyResource()
                          );
                          onFieldChange("modules", next);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Resource
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = cloneForm(formData.modules);
                          next[moduleIndex].lessons = next[
                            moduleIndex
                          ].lessons.filter(
                            (_, itemIndex) => itemIndex !== lessonIndex
                          );
                          onFieldChange("modules", next);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Lesson
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {lesson.resources.map((resource, resourceIndex) => (
                      <div
                        key={`resource-${resourceIndex}`}
                        className="grid gap-3 md:grid-cols-[1fr_180px_1fr_44px]"
                      >
                        <input
                          value={resource.title}
                          onChange={(event) => {
                            const next = cloneForm(formData.modules);
                            next[moduleIndex].lessons[lessonIndex].resources[
                              resourceIndex
                            ].title = event.target.value;
                            onFieldChange("modules", next);
                          }}
                          placeholder="Resource title"
                          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                        <input
                          value={resource.type}
                          onChange={(event) => {
                            const next = cloneForm(formData.modules);
                            next[moduleIndex].lessons[lessonIndex].resources[
                              resourceIndex
                            ].type = event.target.value;
                            onFieldChange("modules", next);
                          }}
                          placeholder="Guide / PDF / Sheet"
                          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                        <input
                          value={resource.href}
                          onChange={(event) => {
                            const next = cloneForm(formData.modules);
                            next[moduleIndex].lessons[lessonIndex].resources[
                              resourceIndex
                            ].href = event.target.value;
                            onFieldChange("modules", next);
                          }}
                          placeholder="https://..."
                          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = cloneForm(formData.modules);
                            next[moduleIndex].lessons[lessonIndex].resources =
                              next[moduleIndex].lessons[
                                lessonIndex
                              ].resources.filter(
                                (_, itemIndex) => itemIndex !== resourceIndex
                              );
                            onFieldChange("modules", next);
                          }}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
