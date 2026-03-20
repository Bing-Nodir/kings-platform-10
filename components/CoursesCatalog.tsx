"use client";

import { useDeferredValue, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/lib/catalog";

type SortKey = "popular" | "rating" | "price-low" | "price-high";

interface CoursesCatalogProps {
  courses: Course[];
}

export default function CoursesCatalog({ courses }: CoursesCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Barchasi");
  const [level, setLevel] = useState("Barchasi");
  const [sortBy, setSortBy] = useState<SortKey>("popular");
  const deferredQuery = useDeferredValue(query);

  const categories = ["Barchasi", ...new Set(courses.map((course) => course.category))];
  const levels = ["Barchasi", ...new Set(courses.map((course) => course.level))];

  const filteredCourses = courses
    .filter((course) => {
      const matchesQuery =
        deferredQuery.trim() === "" ||
        `${course.title} ${course.subtitle} ${course.instructor} ${course.category}`
          .toLowerCase()
          .includes(deferredQuery.toLowerCase());

      const matchesCategory = category === "Barchasi" || course.category === category;
      const matchesLevel = level === "Barchasi" || course.level === level;

      return matchesQuery && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return b.students - a.students;
    });

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Python, SQL, Power BI, IFRS yoki mentor bo'yicha qidiring"
              className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
            >
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="h-11 rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
            >
              <option value="popular">Eng ommabop</option>
              <option value="rating">Reyting</option>
              <option value="price-low">Narx: pastdan</option>
              <option value="price-high">Narx: yuqoridan</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <SlidersHorizontal className="h-4 w-4" /> {filteredCourses.length} ta natija
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" /> Audit preview + certificate track
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-950">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Hech qanday kurs topilmadi. Filtrlarni o'zgartirib ko'ring.
          </p>
        </div>
      )}
    </div>
  );
}
