"use client";

import Link from "next/link";
import { ArrowRight, BookmarkCheck } from "lucide-react";
import { courses } from "@/lib/catalog";
import { useWishlist } from "@/components/WishlistProvider";

export default function SavedCoursesShelf() {
  const { courseIds, isAuthenticated, loading, backendReady } = useWishlist();

  if (loading || !isAuthenticated || !backendReady) {
    return null;
  }

  const savedCourses = courseIds
    .map((courseId) => courses.find((course) => course.id === courseId))
    .filter((course) => Boolean(course))
    .slice(0, 3);

  if (savedCourses.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <BookmarkCheck className="h-3.5 w-3.5" /> Saved for later
          </div>
          <h2 className="mt-3 text-2xl font-black text-gray-950 dark:text-white">
            Saqlangan kurslaringiz
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Keyingi sprint uchun belgilab qo&apos;ygan learning track&apos;laringiz shu yerda.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Dashboard&apos;ga o&apos;tish <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {savedCourses.map((course) => (
          <Link
            key={course!.id}
            href={`/courses/${course!.id}`}
            className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 transition-all hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-black dark:hover:border-blue-900/50"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {course!.category}
            </p>
            <h3 className="mt-2 text-lg font-bold text-gray-950 dark:text-white">
              {course!.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {course!.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
