import Link from "next/link";
import { ArrowRight, Building2, MapPinned, Sparkles, Trophy, Users2 } from "lucide-react";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { LampDemo } from "@/components/ui/lamp";
import { GlowyWavesHero } from "@/components/ui/glowy-waves-hero";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import MapSection from "@/components/MapSection";
import { courses } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content";
import { mentorProfiles } from "@/lib/site";
import RoadmapSection from "@/components/RoadmapSection";
import { createClient } from "@/utils/supabase/server";

const ecosystemCards = [
  {
    title: "Biz haqimizda",
    description:
      "Jamoa, learning model va platforma yondashuvini ko\u2019ring.",
    href: "/about",
    icon: Sparkles,
  },
  {
    title: "Subscription",
    description:
      "Bepul preview, pro access va offline formatlar orasidan mos modelni tanlang.",
    href: "/subscription",
    icon: Users2,
  },
  {
    title: "Korporativ ta\u2018lim",
    description:
      "Jamoangizni professional darajaga yetkazing. Analytics, AI Mentor va guruh sertifikatlari.",
    href: "/business",
    icon: Building2,
  },
  {
    title: "Ofislar xaritasi",
    description:
      "Kampuslar, QR attendance va oflayn workshop nuqtalarini xaritada ko\u2019ring.",
    href: "/offices",
    icon: MapPinned,
  },
  {
    title: "Reyting jadvali",
    description:
      "O\u2018rganish vaqti, quiz natijalari va streak bo\u2018yicha top o\u2018quvchilarni ko\u2018ring.",
    href: "/leaderboard",
    icon: Trophy,
  },
];

const logos = [
  { src: "https://cdn.simpleicons.org/nvidia/000000", alt: "Nvidia Logo" },
  { src: "https://cdn.simpleicons.org/supabase/000000", alt: "Supabase Logo" },
  {
    src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIyLjI4MTkgOS44MjExYTUuOTg0NyA1Ljk4NDcgMCAwIDAtLjUxNTctNC45MTA4IDYuMDQ2MiA2LjA0NjIgMCAwIDAtNi41MDk4LTIuOUE2LjA2NTEgNi4wNjUxIDAgMCAwIDQuOTgwNyA0LjE4MThhNS45ODQ3IDUuOTg0NyAwIDAgMC0zLjk5NzcgMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAgLjc0MjcgNy4wOTY2IDUuOTggNS45OCAwIDAgMCAuNTExIDQuOTEwNyA2LjA1MSA2LjA1MSAwIDAgMCA2LjUxNDYgMi45MDAxQTYuMDY1MSA2LjA2NTEgMCAwIDAgMTkuMDE5MiAxOS44MThhNS45ODQ3IDUuOTg0NyAwIDAgMCAzLjk5NzctMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAtLjczNS03LjA5Njl6bS05LjAyMiAxMi42MDgxYTQuNDc1NSA0LjQ3NTUgMCAwIDEtMi44NzY0LTEuMDQwOGwuMTQxOS0uMDgwNCA0Ljc3ODMtMi43NTgyYS43OTQ4Ljc5NDggMCAwIDAgLjM5MjctLjY4MTN2LTYuNzM2OWwyLjAyIDEuMTY4NmEuMDcxLjA3MSAwIDAgMSAuMDM4LjA1MnY1LjU4MjZhNC41MDQgNC41MDQgMCAwIDEtNC40OTQ1IDQuNDk0NXptLTkuNjYwNy00LjEyNTRhNC40NzA4IDQuNDcwOCAwIDAgMS0uNTM0Ni0zLjAxMzdsLjE0Mi4wODUyIDQuNzgzIDIuNzU4MmEuNzcxMi43NzEyIDAgMCAwIC43ODA2IDBsNS44NDI4LTMuMzY4NXYyLjMzMjRhLjA4MDQuMDgwNCAwIDAgMS0uMDMzMi4wNjE1TDkuNzQgMTkuOTUwMmE0LjQ5OTIgNC40OTkyIDAgMCAxLTYuMTQwOC0xLjY1NXptLTIuMzE2OC05LjA4MDJhNC40ODQ5IDQuNDg0OSAwIDAgMSAyLjM0MS0yLjAwM2wtLjAwNDcuMTYxNHY1LjUxODFhLjc5NDguNzk0OCAwIDAgMCAuMzkyNy42ODEzbDUuODQyOCAzLjM2ODUtMS4wMDUzIDEuNzQzNGEuMDcxLjA3MSAwIDAgMS0uMDY2NC4wMzMybC00LjgzOS0yLjc5MTRhNC41MDQgNC41MDQgMCAwIDEtMi42NjAzLTYuNzA2NXptMTAuNTk4LTQuNDQ0N2E0LjQ4MDIgNC40ODAyIDAgMCAxIDIuODgxIDEuMDQ1NGwtLjE0MTkuMDgtNC43ODMtMi43NTgyYS43OTQ4Ljc5NDggMCAwIDAtLjc4MDYgMGwtNS44NDI4IDMuMzY4NXYtMi4zMzI0YS4wODA0LjA4MDQgMCAwIDEgLjAzMzItLjA2MTVsMy45Mi0yLjI2NGE0LjUwNCA0LjUwNCAwIDAgMSA0LjcxNDItLjA3NzN6bTkuNjY1NSA0LjEyNTRhNC40NzA4IDQuNDcwOCAwIDAgMSAuNTM0NiAzLjAxMzdsLS4xNDItLjA4NTItNC43ODMtMi43NTgyYS43NzEyLjc3MTIgMCAwIDAtLjc4MDYgMGwtNS44NDI4IDMuMzY4NXYtMi4zMzI0YS4wODA0LjA4MDQgMCAwIDEgLjAzMzItLjA2MTVsMy45Mi0yLjI2NGE0LjQ5OTIgNC40OTkyIDAgMCAxIDYuMTQwOCAxLjY1NXpNMTMuMjUgMTUuNjU5OWwtMy4yMy0xLjg2MjRWMTAuMDczbDMuMjMgMS44NjI0djMuNzI0NXptMS4yMjE1LTQuNDk4MS0zLjIzLTEuODYyNCAzLjIzLTEuODYyNCAzLjIzIDEuODYyNC0zLjIzIDEuODYyNHoiLz48L3N2Zz4=",
    alt: "OpenAI Logo",
  },
  { src: "https://cdn.simpleicons.org/python/000000", alt: "Python Logo" },
  { src: "https://cdn.simpleicons.org/vercel/000000", alt: "Vercel Logo" },
  { src: "https://cdn.simpleicons.org/github/000000", alt: "GitHub Logo" },
  { src: "https://cdn.simpleicons.org/anthropic/000000", alt: "Anthropic Logo" },
  { src: "https://cdn.simpleicons.org/react/000000", alt: "React Logo" },
];

// Catalog-dan haqiqiy statistika
const catalogStudentTotal = courses.reduce((sum, c) => sum + c.students, 0);

export default async function Home() {
  const supabase = await createClient();
  const siteContent = await getSiteContent();

  let studentCount: number | null = null;
  let courseCount: number | null = null;

  try {
    const [profilesResult, coursesResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }),
    ]);

    studentCount = profilesResult.error ? null : profilesResult.count;
    courseCount = coursesResult.error ? null : coursesResult.count;
  } catch {
    // Supabase sozlanmagan - catalog ma'lumotlaridan foydalanamiz
  }

  const realStats = [
    {
      label: "Faol O'quvchilar",
      value: studentCount
        ? `${studentCount.toLocaleString()}+`
        : `${catalogStudentTotal.toLocaleString()}+`,
    },
    {
      label: "Flagship Kurslar",
      value: courseCount ? `${courseCount}` : `${courses.length}`,
    },
    {
      label: "Core Mentorlar",
      value: `${mentorProfiles.length}`,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero - light/dark mode */}
      <div className="block dark:hidden">
        <GlowyWavesHero
          stats={realStats}
          badgeText={siteContent.homeHeroBadge}
          titlePrefix={siteContent.homeHeroLightTitlePrefix}
          titleHighlight={siteContent.homeHeroLightTitleHighlight}
          description={siteContent.homeHeroDescription}
        />
      </div>
      <div className="hidden dark:block">
        <LampDemo
          stats={realStats}
          title={siteContent.homeHeroDarkTitle}
          description={siteContent.homeHeroDescription}
        />
      </div>

      {/* Roadmap / Ecosystem diagram */}
      <RoadmapSection />

      {/* Kurslar carousel */}
      <section className="cv-auto overflow-hidden bg-gray-50/50 py-16 dark:bg-gray-950/50 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                {siteContent.homeCoursesEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
                {siteContent.homeCoursesTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-400">
                {siteContent.homeCoursesDescription}
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900 md:inline-flex"
            >
              Barchasini ko'ring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Horizontal scroll carousel */}
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {courses.map((course) => (
              <div
                key={course.id}
                className="w-[320px] shrink-0 snap-center md:w-[380px]"
              >
                <CourseCard {...course} />
              </div>
            ))}
          </div>

          <div className="mt-4 text-center md:hidden">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            >
              Barcha kurslarni ko'ring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem section */}
      <section className="cv-auto bg-white py-16 dark:bg-black md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              {siteContent.homeEcosystemEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
              {siteContent.homeEcosystemTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-400">
              {siteContent.homeEcosystemDescription}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {ecosystemCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-[2rem] border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.15)] dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-500/50 dark:hover:bg-gray-900 dark:hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                  <card.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-5 text-2xl font-black text-gray-950 dark:text-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {card.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Ochish{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MapSection />

      {/* Hamkor logotiplar */}
      <section className="cv-auto relative border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-black md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
            Sohaning eng{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500">
              ishonchli
            </span>{" "}
            texnologiyalari
          </h2>
        </div>
        <div className="relative z-10 mx-auto mt-12 max-w-4xl px-4 md:px-8">
          <LogoCloud logos={logos} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
