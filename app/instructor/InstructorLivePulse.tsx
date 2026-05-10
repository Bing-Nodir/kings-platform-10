"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCcw, Wifi } from "lucide-react";

interface InstructorMetrics {
  totalStudents: number;
  totalRevenue: number;
  estimatedPayout: number;
  averageRating: number;
  publishedCourses: number;
  draftCourses: number;
  reviewQueue: number;
  openQuestions: number;
  uploadedAssets: number;
  completedStudents: number;
  averageProgress: number;
  totalLearningHours: number;
}

interface InstructorSnapshot {
  generatedAt: string;
  metrics: InstructorMetrics;
  workbench: {
    totalSubmissions: number;
    draftCourses: number;
    reviewQueue: number;
    publishedCourses: number;
    uploadedAssets: number;
    openQuestions: number;
    paidOrders: number;
    payoutBatches: number;
    activeStudents: number;
  };
}

function formatMoney(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString("uz-UZ");
}

function isInstructorSnapshot(value: unknown): value is InstructorSnapshot {
  return (
    value !== null &&
    typeof value === "object" &&
    "generatedAt" in value &&
    "metrics" in value &&
    "workbench" in value
  );
}

export default function InstructorLivePulse({
  initialSnapshot,
}: {
  initialSnapshot: InstructorSnapshot;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [state, setState] = useState<"live" | "refreshing" | "stale">("live");

  useEffect(() => {
    let active = true;

    async function refresh() {
      setState("refreshing");

      try {
        const response = await fetch("/api/instructor/control-center", {
          cache: "no-store",
        });
        const payload = (await response.json()) as unknown;

        if (!response.ok || !isInstructorSnapshot(payload)) {
          throw new Error("Instructor snapshot failed");
        }

        if (active) {
          setSnapshot(payload);
          setState("live");
        }
      } catch {
        if (active) {
          setState("stale");
        }
      }
    }

    const interval = window.setInterval(refresh, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const updatedAt = useMemo(
    () => new Date(snapshot.generatedAt).toLocaleTimeString("uz-UZ"),
    [snapshot.generatedAt]
  );

  return (
    <section className="rounded-[1.5rem] border border-emerald-100 bg-emerald-950 px-6 py-4 text-white shadow-sm shadow-emerald-950/20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            {state === "refreshing" ? (
              <RefreshCcw className="h-5 w-5 animate-spin" />
            ) : (
              <Wifi className="h-5 w-5" />
            )}
          </span>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-100">
              Instructor live control
            </p>
            <p className="mt-1 text-sm text-emerald-50/80">
              {state === "stale"
                ? "Oxirgi snapshot ko'rsatilmoqda, refresh yana urinadi."
                : `Workspace yangilandi: ${updatedAt}`}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            ["Students", snapshot.metrics.totalStudents.toLocaleString("uz-UZ")],
            ["Revenue", `${formatMoney(snapshot.metrics.totalRevenue)} so'm`],
            ["Payout", `${formatMoney(snapshot.metrics.estimatedPayout)} so'm`],
            ["Courses", snapshot.metrics.publishedCourses.toLocaleString("uz-UZ")],
            ["Q&A", snapshot.metrics.openQuestions.toLocaleString("uz-UZ")],
            ["Hours", snapshot.metrics.totalLearningHours.toLocaleString("uz-UZ")],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100/80">
                {label}
              </p>
              <p className="mt-1 whitespace-nowrap text-sm font-black text-white">
                {value}
              </p>
            </div>
          ))}
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
            state === "stale"
              ? "bg-amber-300 text-amber-950"
              : "bg-emerald-300 text-emerald-950"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          {state}
        </span>
      </div>
    </section>
  );
}
