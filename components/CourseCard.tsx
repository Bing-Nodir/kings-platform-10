import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { getCourseLessonCount, type Course } from '@/lib/catalog';
import { getCourseExperienceMeta } from '@/lib/course-experience';
import CourseWishlistButton from '@/components/CourseWishlistButton';
import { cn } from '@/lib/utils';

type CourseCardProps = Course & {
  variant?: "default" | "vintage";
};

export default function CourseCard({
  id,
  title,
  subtitle,
  description,
  price,
  duration,
  pace,
  level,
  category,
  rating,
  students,
  instructor,
  heroGradient,
  cardImage,
  modules,
  variant = "default",
}: CourseCardProps) {
  const isVintage = variant === "vintage";
  const experienceMeta = getCourseExperienceMeta({
    id,
    title,
    subtitle,
    description,
    price,
    duration,
    pace,
    level,
    category,
    rating,
    students,
    instructor,
    heroGradient,
    cardImage,
    modules,
    outcomes: [],
    supportItems: [],
    reviews: [],
    language: "O'zbek",
  });
  const previewLessonsCount = modules
    .flatMap((module) => module.lessons)
    .filter((lesson) => lesson.isFree).length;
  const lessonsCount = getCourseLessonCount({
    id,
    title,
    subtitle,
    description,
    price,
    duration,
    pace,
    level,
    category,
    rating,
    students,
    instructor,
    heroGradient,
    modules,
    outcomes: [],
    supportItems: [],
    reviews: [],
    language: "O'zbek",
  });

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2",
        isVintage
          ? "rounded-[1.75rem] border border-amber-200/15 bg-[#0d0a07]/95 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.03] backdrop-blur hover:border-amber-200/35 hover:bg-[#120d08] hover:shadow-[0_40px_120px_rgba(216,168,79,0.15)]"
          : "rounded-3xl border border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-400/50 dark:hover:bg-gray-900/80 dark:hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]"
      )}
    >
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-gradient-to-br",
          isVintage ? "from-[#211307] via-[#33220f] to-[#080604]" : heroGradient
        )}
      >
        {cardImage ? (
          <>
            <Image
              src={cardImage}
              alt={`${title} kurs rasmi`}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
            <div
              className={cn(
                "absolute inset-0",
                isVintage
                  ? "bg-gradient-to-t from-[#070403] via-[#120b06]/70 to-[#2d1a08]/15"
                  : "bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/15"
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                isVintage
                  ? "bg-[radial-gradient(circle_at_top_left,rgba(216,168,79,0.34),transparent_40%),radial-gradient(circle_at_85%_12%,rgba(20,184,166,0.16),transparent_28%)]"
                  : "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_40%)]"
              )}
            />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0",
              isVintage
                ? "bg-[radial-gradient(circle_at_top_left,rgba(216,168,79,0.28),transparent_45%)]"
                : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_45%)]"
            )}
          />
        )}
        {isVintage ? (
          <>
            <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(216,168,79,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(216,168,79,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-amber-200/35 shadow-[0_0_24px_rgba(216,168,79,0.4)]" />
          </>
        ) : null}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm",
              isVintage
                ? "border border-amber-200/20 bg-black/75 text-amber-100"
                : "bg-white/90 text-gray-900 dark:bg-black/90 dark:text-white"
            )}
          >
            {category}
          </span>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm",
              isVintage
                ? "border-amber-200/25 bg-amber-200/10"
                : "border-white/30 bg-black/20"
            )}
          >
            {level}
          </span>
        </div>
        <div className="absolute right-4 top-4">
          <CourseWishlistButton
            className={
              isVintage
                ? "border-amber-200/20 bg-black/65 text-amber-100 hover:bg-black/80"
                : undefined
            }
            courseId={id}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p
            className={cn(
              "text-xs uppercase tracking-[0.2em]",
              isVintage ? "text-amber-100/70" : "text-white/70"
            )}
          >
            {pace}
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight">{title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between text-xs font-medium">
          <span className={isVintage ? "text-stone-400" : "text-gray-500 dark:text-gray-400"}>
            {instructor}
          </span>
          <div className={cn("flex items-center", isVintage ? "text-amber-300" : "text-amber-500")}>
            <Star className="mr-1 h-3.5 w-3.5 fill-current" />
            {rating}
          </div>
        </div>

        <p
          className={cn(
            "mb-6 flex-1 line-clamp-3 text-sm",
            isVintage ? "text-stone-400" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {description}
        </p>

        <div
          className={cn(
            "mb-6 grid grid-cols-2 gap-3 text-sm font-medium",
            isVintage ? "text-stone-400" : "text-gray-500 dark:text-gray-400"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {duration}
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {lessonsCount} dars
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {students.toLocaleString()} o&apos;quvchi
          </div>
          <div
            className={cn(
              "col-span-2 rounded-2xl px-3 py-2 text-xs font-semibold",
              isVintage
                ? "border border-amber-200/12 bg-amber-200/10 text-amber-100"
                : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
            )}
          >
            Birinchi {previewLessonsCount} dars bepul preview
          </div>
          {experienceMeta && (
            <div className="col-span-2 flex flex-wrap gap-2">
              {experienceMeta.skills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                    isVintage
                      ? "border-amber-200/12 bg-black/25 text-stone-400"
                      : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                  )}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span
            className={cn(
              "text-xl font-black",
              isVintage ? "text-amber-100" : "text-gray-900 dark:text-white"
            )}
          >
            {price === 0 ? 'Bepul' : `${price.toLocaleString()} UZS`}
          </span>
          <Link
            href={`/courses/${id}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              isVintage
                ? "border border-amber-200/15 bg-amber-200/10 text-amber-100 hover:bg-amber-200/18"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
            )}
          >
            Batafsil
          </Link>
        </div>
      </div>
    </article>
  );
}
