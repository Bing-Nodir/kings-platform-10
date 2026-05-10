import Link from "next/link";
import { ArrowRight, Compass, Search, Sparkles, Users2 } from "lucide-react";
import Footer from "@/components/Footer";
import { getCoursesData, getMentorProfilesData } from "@/lib/content-store";

const sitePages = [
  {
    title: "Biz haqimizda",
    description: "Kings Education yondashuvi, jamoa va learning model.",
    href: "/about",
    keywords: "about kings education jamoa asoschilar company learning model",
  },
  {
    title: "Mentorlar",
    description: "Asosiy mentorlar, tajriba va ekspert yo'nalishlari.",
    href: "/mentors",
    keywords: "mentor mentorlar instructor ustoz asoschilar",
  },
  {
    title: "Subscription",
    description: "Bepul preview, pro access va offline formatlar.",
    href: "/subscription",
    keywords: "subscription pricing plan pro bepul preview to'lov",
  },
  {
    title: "Ofislar",
    description: "Oflayn markaz, kampus va xarita ma'lumotlari.",
    href: "/offices",
    keywords: "office ofis map xarita kampus location",
  },
  {
    title: "Kontakt",
    description: "Jamoa bilan bog'lanish va yozilish bo'yicha support.",
    href: "/contact",
    keywords: "contact aloqa bog'lanish support",
  },
];

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const [courses, mentorProfiles] = await Promise.all([
    getCoursesData(),
    getMentorProfilesData(),
  ]);
  const query = q?.trim() ?? "";
  const normalized = normalize(query);

  const courseResults = normalized
    ? courses.filter((course) =>
        [
          course.title,
          course.subtitle,
          course.description,
          course.category,
          course.instructor,
          course.level,
          ...course.outcomes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
    : [];

  const mentorResults = normalized
    ? mentorProfiles.filter((mentor) =>
        [mentor.name, mentor.role, mentor.bio, ...mentor.expertise]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
    : [];

  const pageResults = normalized
    ? sitePages.filter((page) =>
        [page.title, page.description, page.keywords]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
    : [];

  const totalResults =
    courseResults.length + mentorResults.length + pageResults.length;

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_55%,#000000_100%)]">
        <section className="border-b border-gray-200/70 dark:border-gray-800">
          <div className="container mx-auto px-4 py-14 md:px-8 md:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
              <Sparkles className="h-4 w-4" /> Global search
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-gray-950 dark:text-white md:text-6xl">
              Kurs, mentor va muhim bo'limlarni bir joydan qidiring
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-400">
              Python, SQL, database, AI, Power BI, data analytics, data science yoki ACCA IFRS bo'yicha kerakli sahifani tez toping.
            </p>

            <form action="/search" className="mt-8 max-w-3xl">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Masalan: Python, IFRS, Power BI yoki Mirshod Juraev"
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-28 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Qidirish
                </button>
              </div>
            </form>

            {query && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                  &quot;{query}&quot;
                </span>{" "}
                bo'yicha {totalResults} ta natija topildi.
              </p>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          {!query && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <Compass className="h-4 w-4" /> Tez boshlash
                </div>
                <h2 className="mt-4 text-3xl font-black text-gray-950 dark:text-white">
                  Eng ko'p qidiriladigan yo'nalishlar
                </h2>
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    "Python",
                    "SQL",
                    "Database",
                    "AI",
                    "Power BI",
                    "Data Analytics",
                    "Data Science",
                    "IFRS",
                  ].map((item) => (
                    <Link
                      key={item}
                      href={`/search?q=${encodeURIComponent(item)}`}
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <Users2 className="h-4 w-4" /> Mentorlar
                </div>
                <div className="mt-5 space-y-4">
                  {mentorProfiles.map((mentor) => (
                    <Link
                      key={mentor.name}
                      href={`/search?q=${encodeURIComponent(mentor.name)}`}
                      className="block rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-blue-950/20"
                    >
                      <p className="font-bold text-gray-950 dark:text-white">
                        {mentor.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {mentor.role}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-950">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Hech qanday natija topilmadi
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                So'zni qisqartirib yoki boshqa kalit ibora bilan qidiring. Masalan: Python, IFRS, Power BI, SQL yoki mentor ismi.
              </p>
            </div>
          )}

          {courseResults.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                Kurslar
              </h2>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {courseResults.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className={`rounded-2xl bg-gradient-to-br ${course.heroGradient} p-5 text-white`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                        {course.category}
                      </p>
                      <h3 className="mt-2 text-2xl font-black">{course.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/85">
                        {course.subtitle}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{course.instructor}</span>
                      <span>{course.duration}</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                      {course.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Kursni ochish <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {mentorResults.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                Asoschilar va mentorlar
              </h2>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {mentorResults.map((mentor) => (
                  <Link
                    key={mentor.name}
                    href="/mentors"
                    className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <p className="text-2xl font-black text-gray-950 dark:text-white">
                      {mentor.name}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {mentor.role}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                      {mentor.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.expertise.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {pageResults.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                Sayt bo'limlari
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {pageResults.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <p className="text-xl font-black text-gray-950 dark:text-white">
                      {page.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                      {page.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Ochish <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
