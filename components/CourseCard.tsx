import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { getCourseLessonCount, type Course } from '@/lib/catalog';
import { getCourseExperienceMeta } from '@/lib/course-experience';
import CourseWishlistButton from '@/components/CourseWishlistButton';

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
}: Course) {
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
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-400/50 dark:hover:bg-gray-900/80 dark:hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]">
      <div className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${heroGradient}`}>
        {cardImage ? (
          <>
            <Image
              src={cardImage}
              alt={`${title} kurs rasmi`}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/15" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_40%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_45%)]" />
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur-sm dark:bg-black/90 dark:text-white">
            {category}
          </span>
          <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {level}
          </span>
        </div>
        <div className="absolute right-4 top-4">
          <CourseWishlistButton courseId={id} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">{pace}</p>
          <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight">{title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between text-xs font-medium">
          <span className="text-gray-500 dark:text-gray-400">{instructor}</span>
          <div className="flex items-center text-amber-500">
            <Star className="mr-1 h-3.5 w-3.5 fill-current" />
            {rating}
          </div>
        </div>

        <p className="mb-6 flex-1 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {duration}
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {lessonsCount} dars
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {students.toLocaleString()} o&apos;quvchi
          </div>
          <div className="col-span-2 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
            Birinchi {previewLessonsCount} dars bepul preview
          </div>
          {experienceMeta && (
            <div className="col-span-2 flex flex-wrap gap-2">
              {experienceMeta.skills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-black text-gray-900 dark:text-white">
            {price === 0 ? 'Bepul' : `${price.toLocaleString()} UZS`}
          </span>
          <Link
            href={`/courses/${id}`}
            className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
          >
            Batafsil
          </Link>
        </div>
      </div>
    </article>
  );
}
