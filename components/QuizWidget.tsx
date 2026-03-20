"use client";

import { useEffect, useEffectEvent, useState } from "react";
import {
  Trophy,
  RotateCcw,
  CheckCircle,
  XCircle,
  BookOpen,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";
import type { CourseQuiz } from "@/lib/quizzes";

interface QuizWidgetProps {
  quiz: CourseQuiz;
  courseId: string;
  isEnrolled: boolean;
}

type Phase = "intro" | "question" | "result";
type QuizMode = "practice" | "challenge";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function QuizWidget({
  quiz,
  courseId,
  isEnrolled,
}: QuizWidgetProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<QuizMode>("practice");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const current = quiz.questions[currentIdx];
  const total = quiz.questions.length;
  const challengeTimeLimit = total * 45;

  const handleChallengeTimeout = useEffectEvent(() => {
    void finishQuiz();
  });

  useEffect(() => {
    if (!isEnrolled) {
      return;
    }

    fetch(`/api/quiz?courseId=${courseId}`)
      .then((response) => response.json())
      .then(({ best, attempts: previousAttempts }) => {
        if (best) {
          setBestScore(best.percent);
        }

        if (previousAttempts) {
          setAttempts(previousAttempts.length);
        }
      })
      .catch(() => {});
  }, [courseId, isEnrolled]);

  useEffect(() => {
    if (phase !== "question") {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [phase, startTime]);

  useEffect(() => {
    if (phase !== "question" || mode !== "challenge") {
      return;
    }

    if (elapsed >= challengeTimeLimit) {
      handleChallengeTimeout();
    }
  }, [challengeTimeLimit, elapsed, mode, phase]);

  function startQuiz(nextMode: QuizMode) {
    setMode(nextMode);
    setPhase("question");
    setCurrentIdx(0);
    setAnswers({});
    setSelected(null);
    setShowExplanation(false);
    setStartTime(Date.now());
    setElapsed(0);
  }

  function handleSelect(optionId: string) {
    if (selected) {
      return;
    }

    setSelected(optionId);
    setShowExplanation(true);
    setAnswers((previous) => ({ ...previous, [current.id]: optionId }));
  }

  function handleNext() {
    if (currentIdx < total - 1) {
      setCurrentIdx((previous) => previous + 1);
      setSelected(null);
      setShowExplanation(false);
      return;
    }

    void finishQuiz();
  }

  async function finishQuiz() {
    const score = Object.entries(answers).filter(([questionId, answerId]) => {
      const question = quiz.questions.find((entry) => entry.id === questionId);
      return question && question.correctId === answerId;
    }).length;
    const percent = Math.round((score / total) * 100);
    const passed = percent >= quiz.passingScore;

    setPhase("result");

    if (bestScore === null || percent > bestScore) {
      setBestScore(percent);
    }

    setAttempts((previous) => previous + 1);

    if (!isEnrolled) {
      return;
    }

    setSaving(true);

    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          score,
          total,
          percent,
          passed,
          answers: Object.entries(answers).map(([qId, ans]) => ({ qId, ans })),
        }),
      });
    } catch {
      // Ignore background save issues in the UI and keep the learning flow intact.
    } finally {
      setSaving(false);
    }
  }

  const score = Object.entries(answers).filter(([questionId, answerId]) => {
    const question = quiz.questions.find((entry) => entry.id === questionId);
    return question && question.correctId === answerId;
  }).length;
  const finalPercent = Math.round((score / total) * 100);
  const passed = finalPercent >= quiz.passingScore;

  if (phase === "intro") {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {quiz.title}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Practice mode orqali tushunchalarni mustahkamlang yoki challenge mode bilan vaqtga qarshi ishlang.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Savollar", value: `${total} ta` },
              { label: "O'tish bali", value: `${quiz.passingScore}%` },
              { label: "Urinishlar", value: `${attempts} ta` },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {bestScore !== null && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Eng yaxshi natijangiz: {bestScore}%
              </span>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => startQuiz("practice")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              Practice mode
            </button>
            <button
              onClick={() => startQuiz("challenge")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 py-3.5 text-sm font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-100 active:scale-95 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-300 dark:hover:bg-purple-950/30"
            >
              <Clock className="h-4 w-4" />
              Challenge mode
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Challenge mode vaqt limiti: {formatTime(challengeTimeLimit)}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "question") {
    const isCorrect = selected === current.correctId;

    return (
      <div className="flex h-full flex-col">
        <div className="px-4 pt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
            <span>
              Savol {currentIdx + 1} / {total}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {mode === "challenge"
                ? `${formatTime(Math.max(challengeTimeLimit - elapsed, 0))} qoldi`
                : formatTime(elapsed)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            {mode === "challenge" ? "Timed challenge" : "Practice review"}
          </div>
          <p className="mb-5 text-base font-semibold leading-relaxed text-gray-900 dark:text-white">
            {current.question}
          </p>

          <div className="space-y-2.5">
            {current.options.map((option) => {
              let style =
                "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300";

              if (selected) {
                if (option.id === current.correctId) {
                  style =
                    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
                } else if (option.id === selected && !isCorrect) {
                  style =
                    "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300";
                }
              } else {
                style =
                  "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-600 dark:hover:bg-blue-950/30";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  disabled={Boolean(selected)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-all disabled:cursor-default ${style}`}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {option.id.toUpperCase()}
                  </span>
                  <span className="leading-relaxed">{option.text}</span>
                  {selected && option.id === current.correctId && (
                    <CheckCircle className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  {selected && option.id === selected && !isCorrect && (
                    <XCircle className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm leading-relaxed ${
                isCorrect
                  ? "border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-amber-100 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300"
              }`}
            >
              <p className="mb-1 font-semibold">
                {isCorrect ? "To'g'ri" : "Noto'g'ri"}
              </p>
              <p>{current.explanation}</p>
            </div>
          )}
        </div>

        {selected && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <button
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              {currentIdx < total - 1 ? "Keyingi savol" : "Yakunlash"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div
          className={`mx-auto mb-6 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 shadow-lg ${
            passed
              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
              : "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30"
          }`}
        >
          <span
            className={`text-3xl font-black ${
              passed
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {finalPercent}%
          </span>
          <span
            className={`text-xs font-medium ${
              passed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {score}/{total}
          </span>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {passed ? "Tabriklaymiz!" : "Qayta urinib ko'ring!"}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {passed
            ? `O'tish bali: ${quiz.passingScore}%. Siz ${finalPercent}% bilan o'tdingiz!`
            : `O'tish bali: ${quiz.passingScore}%. Biroz kam bo'ldi, qayta o'qib urinib ko'ring.`}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          {mode === "challenge" ? "Challenge mode" : "Practice mode"} | {formatTime(elapsed)}
        </div>

        <div className="mt-6 space-y-2 text-left">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const correct = userAnswer === question.correctId;

            return (
              <div
                key={question.id}
                className={`flex items-start gap-3 rounded-xl p-3 text-sm ${
                  correct
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "bg-red-50 dark:bg-red-950/20"
                }`}
              >
                {correct ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                )}
                <span
                  className={`line-clamp-2 text-xs leading-relaxed ${
                    correct
                      ? "text-emerald-800 dark:text-emerald-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  {index + 1}. {question.question}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => startQuiz(mode)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <RotateCcw className="h-4 w-4" />
          Qayta boshlash
        </button>

        {saving && (
          <p className="mt-3 text-xs text-gray-400">Natija saqlanmoqda...</p>
        )}
      </div>
    </div>
  );
}
