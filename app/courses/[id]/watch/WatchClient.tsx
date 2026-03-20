"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  FileText,
  Lock,
  PlayCircle,
  Sparkles,
  StickyNote,
} from "lucide-react";
import AIMentor from "@/components/AIMentor";
import CourseLessonPlayer from "@/components/CourseLessonPlayer";
import QuizWidget from "@/components/QuizWidget";
import type { Course } from "@/lib/catalog";
import { getMasteryLevel } from "@/lib/course-experience";
import { getQuizByCourseId } from "@/lib/quizzes";

type Tab = "overview" | "mentor" | "resources" | "notes" | "quiz";
type SaveState = "idle" | "saving" | "saved" | "error";
type NotesSaveState = "idle" | "saving" | "saved";

interface WatchClientProps {
  course: Course;
  initialProgress: number;
  initialLessonId: string;
  isEnrolled: boolean;
  canUseMentor: boolean;
  checkoutHref: string;
}

export default function WatchClient({
  course,
  initialProgress,
  initialLessonId,
  isEnrolled,
  canUseMentor,
  checkoutHref,
}: WatchClientProps) {
  const allLessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
    }))
  );

  const accessibleLessons = allLessons.filter(
    (lesson) => isEnrolled || lesson.isFree
  );
  const accessibleIds = new Set(accessibleLessons.map((lesson) => lesson.id));

  const courseQuiz = getQuizByCourseId(course.id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);
  const [notes, setNotes] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [notesSaveState, setNotesSaveState] = useState<NotesSaveState>("idle");
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justLoadedRef = useRef(false);
  const [trackedProgress, setTrackedProgress] = useState(initialProgress);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set([
      allLessons.find((lesson) => lesson.id === initialLessonId)?.moduleId ??
        course.modules[0]?.id ??
        "",
    ])
  );

  const activeLesson =
    allLessons.find((lesson) => lesson.id === activeLessonId) ??
    accessibleLessons[0] ??
    allLessons[0];

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("lesson", activeLessonId);
    window.history.replaceState(null, "", url);
  }, [activeLessonId]);

  // Load notes from DB on mount (enrolled users only)
  useEffect(() => {
    if (!isEnrolled) return;
    fetch(`/api/notes?courseId=${course.id}`)
      .then((r) => r.json())
      .then(({ content }: { content?: string }) => {
        justLoadedRef.current = true;
        setNotes(content ?? "");
        setNotesLoaded(true);
      })
      .catch(() => setNotesLoaded(true));
  }, [course.id, isEnrolled]);

  // Auto-save notes with 800ms debounce
  const saveNotes = useCallback(
    (content: string) => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
      setNotesSaveState("saving");
      notesTimerRef.current = setTimeout(() => {
        fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id, content }),
        })
          .then(() => setNotesSaveState("saved"))
          .catch(() => setNotesSaveState("idle"));
      }, 800);
    },
    [course.id]
  );

  useEffect(() => {
    if (!isEnrolled || !notesLoaded) return;
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    saveNotes(notes);
    return () => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    };
  }, [notes, isEnrolled, notesLoaded, saveNotes]);

  useEffect(() => {
    if (!isEnrolled) {
      return;
    }

    let pageHidden = false;
    const startedAt = Date.now();

    async function persistProgress(keepalive = false) {
      const elapsedMs = Date.now() - startedAt;
      const durationMinutes =
        elapsedMs >= 30_000 ? Math.max(1, Math.round(elapsedMs / 60_000)) : 0;

      if (!keepalive) {
        setSaveState("saving");
      }

      try {
        const response = await fetch("/api/learning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            lessonId: activeLessonId,
            durationMinutes,
          }),
          keepalive,
        });

        const payload = (await response.json().catch(() => null)) as
          | { progressPercent?: number; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload?.error ?? "Progressni saqlashda muammo yuz berdi."
          );
        }

        if (typeof payload?.progressPercent === "number") {
          setTrackedProgress(payload.progressPercent);
        }

        if (!keepalive) {
          setSaveState("saved");
        }
      } catch {
        if (!keepalive) {
          setSaveState("error");
        }
      }
    }

    function handlePageHide() {
      pageHidden = true;
      const elapsedMs = Date.now() - startedAt;
      const durationMinutes =
        elapsedMs >= 30_000 ? Math.max(1, Math.round(elapsedMs / 60_000)) : 0;

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/learning",
          new Blob(
            [
              JSON.stringify({
                courseId: course.id,
                lessonId: activeLessonId,
                durationMinutes,
              }),
            ],
            { type: "application/json" }
          )
        );
      }
    }

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);

      if (!pageHidden) {
        void persistProgress(true);
      }
    };
  }, [activeLessonId, course.id, isEnrolled]);

  if (!activeLesson) {
    return null;
  }

  const currentAccessibleIndex = accessibleLessons.findIndex(
    (lesson) => lesson.id === activeLesson.id
  );
  const previousLesson =
    currentAccessibleIndex > 0
      ? accessibleLessons[currentAccessibleIndex - 1]
      : null;
  const nextLesson =
    currentAccessibleIndex >= 0 &&
    currentAccessibleIndex < accessibleLessons.length - 1
      ? accessibleLessons[currentAccessibleIndex + 1]
      : null;

  const progressPercent = isEnrolled
    ? Math.max(
        trackedProgress,
        Math.round(((currentAccessibleIndex + 1) / Math.max(allLessons.length, 1)) * 100)
      )
    : Math.round(
        ((currentAccessibleIndex + 1) / Math.max(accessibleLessons.length, 1)) *
          100
      );

  const completedLessons = isEnrolled
    ? Math.max(0, Math.floor((trackedProgress / 100) * allLessons.length))
    : Math.max(0, currentAccessibleIndex);
  const mastery = getMasteryLevel(progressPercent);

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: "Dars haqida", icon: BookOpenText },
    {
      id: "mentor",
      label: canUseMentor ? "AI Mentor" : "AI Mentor Pro",
      icon: Sparkles,
    },
    {
      id: "resources",
      label: `Resurslar (${activeLesson.resources.length})`,
      icon: FileText,
    },
    { id: "notes", label: "Qaydlar", icon: StickyNote },
    ...(courseQuiz ? [{ id: "quiz" as Tab, label: "Test", icon: ClipboardCheck }] : []),
  ];

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const saveStateMessage = !isEnrolled
    ? "Preview rejimida faqat bepul darslar ochiq"
    : saveState === "saving"
      ? "Progress saqlanmoqda..."
      : saveState === "saved"
        ? "Oxirgi dars backendga saqlandi"
        : saveState === "error"
          ? "Progressni saqlashda muammo bo'ldi"
          : `${completedLessons} ta dars tugallangan deb belgilangan`;

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <main className="flex w-full flex-col lg:w-[calc(100%-350px)] xl:w-[calc(100%-400px)]">
        <div className="overflow-hidden border-b border-gray-200 bg-black dark:border-gray-800">
          <CourseLessonPlayer
            title={activeLesson.title}
            summary={activeLesson.summary}
            moduleTitle={activeLesson.moduleTitle}
            duration={activeLesson.duration}
            heroGradient={course.heroGradient}
            accessLabel={isEnrolled ? "Premium access" : "Preview access"}
            helperText={
              isEnrolled
                ? "Videoni ko'ring, resurslarni oching va savollarni AI Mentor bilan mustahkamlang."
                : "Birinchi bepul darslarni ko'rib chiqing va to'liq access uchun kursni oching."
            }
            videoUrl={activeLesson.videoUrl}
            videoMimeType={activeLesson.videoMimeType}
            uploadFilePath={activeLesson.uploadFilePath}
          />

          <div className="border-t border-white/10 bg-gray-950 px-4 py-4 text-white md:px-6">
            <div className="mb-2 h-1.5 w-full rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${((currentAccessibleIndex + 1) / Math.max(accessibleLessons.length, 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex flex-col gap-2 text-xs font-medium text-white/80 md:flex-row md:items-center md:justify-between">
              <span>{activeLesson.duration} | {activeLesson.moduleTitle}</span>
              <span>
                {isEnrolled
                  ? "HD lesson | mentor mode available"
                  : "Preview lesson | premium unlock available"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="border-b border-gray-200 px-4 pt-4 dark:border-gray-800 md:px-6">
            <div className="flex flex-wrap gap-5 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <tab.icon
                    className={`h-4 w-4 ${tab.id === "mentor" ? "text-purple-500" : ""}`}
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6 p-4 md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Lesson overview
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                    {activeLesson.title}
                  </h3>
                  <p className="mt-4 max-w-3xl text-sm leading-8 text-gray-600 dark:text-gray-400 md:text-base">
                    {activeLesson.summary}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Joriy modul
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {activeLesson.moduleTitle}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Duration
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {activeLesson.duration}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Access
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {isEnrolled
                        ? "Premium"
                        : activeLesson.isFree
                          ? "Preview"
                          : "Locked"}
                    </p>
                  </div>
                </div>

                {!isEnrolled && (
                  <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                      To'liq kursni oching
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-blue-700 dark:text-blue-300">
                      Birinchi bepul darslar bilan tanishib bo'lgach, qolgan premium lessonlar, AI Mentor va to'liq learning room to'lovdan keyin darhol ochiladi.
                    </p>
                    <Link
                      href={checkoutHref}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Premium access olish
                    </Link>
                  </div>
                )}

                <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Shu darsda qilinadigan ishlar
                  </h4>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      "Videoni tomosha qilish va asosiy g'oyalarni ajratib olish",
                      "Berilgan resurslar asosida mini mashqni bajarish",
                      isEnrolled
                        ? "Qiyin joylarni AI Mentor bilan muhokama qilish"
                        : "Premium darslar ochilishi uchun course structure bilan tanishish",
                      "Keyingi darsga o'tishdan oldin asosiy xulosalarni qayd etish",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mentor" && (
              <div className="h-[540px]">
                {canUseMentor ? (
                  <AIMentor
                    courseId={course.id}
                    lessonTitle={activeLesson.title}
                    progressPercent={progressPercent}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="w-full max-w-xl rounded-[2rem] border border-purple-200 bg-purple-50 p-8 text-center dark:border-purple-900/30 dark:bg-purple-950/20">
                      <Sparkles className="mx-auto h-8 w-8 text-purple-500" />
                      <h3 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
                        AI Mentor premium access ichida ochiladi
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        Preview rejimida video va curriculum bilan tanishasiz. AI Mentor, progress tracking va barcha premium lessonlar to'liq access olgandan keyin ishga tushadi.
                      </p>
                      <Link
                        href={checkoutHref}
                        className="mt-5 inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                      >
                        To'liq access olish
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="space-y-4 p-4 md:p-6">
                <h3 className="text-xl font-black text-gray-950 dark:text-white">
                  Dars resurslari
                </h3>
                {activeLesson.resources.map((resource) => (
                  <a
                    key={`${resource.title}-${resource.type}`}
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 transition-colors hover:border-blue-200 hover:bg-white dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900/50 dark:hover:bg-gray-950"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-400">{resource.type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                      Ochish
                    </span>
                  </a>
                ))}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-950 dark:text-white">
                      Shaxsiy qaydlar
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Muhim fikrlar, savollar va keyingi sprint uchun eslatmalarni shu yerga yozing.
                    </p>
                  </div>
                  {isEnrolled && notesSaveState !== "idle" && (
                    <span className="mt-1 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {notesSaveState === "saving" ? "Saqlanmoqda..." : "Saqlandi"}
                    </span>
                  )}
                </div>
                {isEnrolled ? (
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={12}
                    placeholder="Muhim fikrlar, savollar va keyingi amaliy mashqlarni shu yerga yozib boring."
                    className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-950"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
                    <StickyNote className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qaydlarni saqlash uchun kursga yoziling
                    </p>
                    <Link
                      href={checkoutHref}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Premium access olish
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "quiz" && courseQuiz && (
              <div className="h-[540px] overflow-y-auto">
                {isEnrolled ? (
                  <QuizWidget
                    quiz={courseQuiz}
                    courseId={course.id}
                    isEnrolled={isEnrolled}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="w-full max-w-xl rounded-[2rem] border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-900/30 dark:bg-blue-950/20">
                      <ClipboardCheck className="mx-auto h-8 w-8 text-blue-500" />
                      <h3 className="mt-4 text-2xl font-black text-gray-950 dark:text-white">
                        Test premium access ichida ochiladi
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        Kursga yozilganingizdan so'ng bilimingizni testlar orqali tekshira olasiz.
                      </p>
                      <Link
                        href={checkoutHref}
                        className="mt-5 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        To'liq access olish
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Navigation
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Hozir: {currentAccessibleIndex + 1} / {accessibleLessons.length} ochiq dars
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => previousLesson && setActiveLessonId(previousLesson.id)}
                  disabled={!previousLesson}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" /> Oldingi
                </button>
                <button
                  type="button"
                  onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                  disabled={!nextLesson}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Keyingi <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="w-full shrink-0 border-l border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 lg:h-[calc(100vh-64px)] lg:w-[350px] lg:overflow-y-auto xl:w-[400px]">
        <div className="p-4 md:p-5">
          <div className="mb-5 rounded-[1.5rem] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {isEnrolled ? "Kurs progressi" : "Preview progressi"}
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {progressPercent}%
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {saveStateMessage}
            </p>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Mastery stage
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${mastery.className}`}
                >
                  {mastery.label}
                </span>
              </div>
              <p className="mt-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
                {mastery.description}
              </p>
            </div>
            {!isEnrolled && (
              <Link
                href={checkoutHref}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Premium access olish
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {course.modules.map((module) => {
              const isOpen = openModules.has(module.id);

              return (
                <div
                  key={module.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {module.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {module.lessons.length} ta dars
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      <div className="flex flex-col p-2">
                        {module.lessons.map((lesson) => {
                          const lessonIndex = allLessons.findIndex(
                            (item) => item.id === lesson.id
                          );
                          const isActive = lesson.id === activeLesson.id;
                          const isCompleted =
                            isEnrolled && lessonIndex < completedLessons;
                          const isAccessible = accessibleIds.has(lesson.id);

                          return (
                            <button
                              type="button"
                              key={lesson.id}
                              onClick={() =>
                                isAccessible && setActiveLessonId(lesson.id)
                              }
                              disabled={!isAccessible}
                              className={`flex items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                                isActive
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : isAccessible
                                    ? "hover:bg-gray-50 dark:hover:bg-gray-900"
                                    : "opacity-70"
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : isActive ? (
                                  <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                ) : isAccessible ? (
                                  <Circle className="h-5 w-5 text-gray-300 dark:text-gray-700" />
                                ) : (
                                  <Lock className="h-5 w-5 text-gray-300 dark:text-gray-700" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={`line-clamp-2 text-sm font-medium ${
                                    isActive
                                      ? "text-blue-700 dark:text-blue-300"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                <span className="mt-1 block text-xs text-gray-400">
                                  {isAccessible
                                    ? `Video | ${lesson.duration}`
                                    : "Premium lesson"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
