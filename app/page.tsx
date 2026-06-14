import Link from "next/link";
import { ArrowRight, Building2, MapPinned, Sparkles, Trophy, Users2 } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";
import HomeCoursesCarousel from "@/components/HomeCoursesCarousel";
import MapSection from "@/components/MapSection";
import RoadmapSection from "@/components/RoadmapSection";
import VintageBentoEcosystem from "@/components/VintageBentoEcosystem";
import VintageGlobeSection from "@/components/VintageGlobeSection";
import { LampDemo } from "@/components/ui/lamp";
import { GlowyWavesHero } from "@/components/ui/glowy-waves-hero";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import { PrismaHero } from "@/components/ui/prisma-hero";
import {
  getCoursesData,
  getHomeEcosystemCardsData,
  getHomepageStatsData,
} from "@/lib/content-store";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 300;

const ecosystemIcons = {
  Sparkles,
  Users2,
  Building2,
  MapPinned,
  Trophy,
} as const;

const logos = [
  { src: "inline:nvidia", alt: "Nvidia Logo" },
  { src: "inline:supabase", alt: "Supabase Logo" },
  { src: "inline:openai", alt: "OpenAI Logo" },
  { src: "inline:python", alt: "Python Logo" },
  { src: "inline:vercel", alt: "Vercel Logo" },
  { src: "inline:github", alt: "GitHub Logo" },
  { src: "inline:anthropic", alt: "Anthropic Logo" },
  { src: "inline:react", alt: "React Logo" },
];

export default async function Home() {
  const [siteContent, courses, ecosystemCards, homepageStats] = await Promise.all([
    getSiteContent(),
    getCoursesData(),
    getHomeEcosystemCardsData(),
    getHomepageStatsData(),
  ]);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="theme-hidden-vintage block dark:hidden">
        <GlowyWavesHero
          stats={homepageStats}
          badgeText={siteContent.homeHeroBadge}
          titlePrefix={siteContent.homeHeroLightTitlePrefix}
          titleHighlight={siteContent.homeHeroLightTitleHighlight}
          description={siteContent.homeHeroDescription}
        />
      </div>
      <div className="theme-hidden-vintage hidden dark:block">
        <LampDemo
          stats={homepageStats}
          title={siteContent.homeHeroDarkTitle}
          description={siteContent.homeHeroDescription}
        />
      </div>
      <div className="theme-only-vintage">
        <PrismaHero
          ctaHref="/courses"
          ctaLabel="Kurslarni ko'rish"
          description={siteContent.homeHeroDescription}
          showNav={false}
          title="Kings"
        />
      </div>

      <RoadmapSection />

      <section className="theme-hidden-vintage cv-auto overflow-hidden bg-gray-50/50 py-16 dark:bg-gray-950/50 md:py-24">
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
              Barcha kurslarni ko'ring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <HomeCoursesCarousel>
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </HomeCoursesCarousel>

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

      <section className="theme-only-vintage cv-auto relative overflow-hidden bg-[#0d0906] py-16 text-stone-100 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(216,168,79,0.18),transparent_30%),radial-gradient(circle_at_84%_62%,rgba(20,184,166,0.11),transparent_26%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(216,168,79,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(216,168,79,0.1)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-amber-200/20" />

        <div className="container relative mx-auto px-4 md:px-8">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300/80">
                {siteContent.homeCoursesEyebrow}
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-stone-50 md:text-6xl">
                {siteContent.homeCoursesTitle}
              </h2>
              <p className="mt-5 max-w-4xl text-base leading-8 text-stone-300/78 md:text-lg">
                {siteContent.homeCoursesDescription}
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden shrink-0 items-center gap-2 rounded-full border border-amber-200/18 bg-black/35 px-6 py-3 text-sm font-black text-amber-100 shadow-[0_18px_55px_rgba(0,0,0,0.22)] ring-1 ring-white/[0.03] backdrop-blur transition-colors hover:border-amber-200/35 hover:bg-amber-200/10 md:inline-flex"
            >
              Barchasini ko'ring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-amber-200/10 bg-black/20 px-0 py-4 shadow-[0_36px_120px_rgba(0,0,0,0.34)] ring-1 ring-white/[0.025]">
            <HomeCoursesCarousel variant="vintage">
              {courses.map((course) => (
                <CourseCard key={course.id} variant="vintage" {...course} />
              ))}
            </HomeCoursesCarousel>
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-black/35 px-5 py-2.5 text-sm font-black text-amber-100 backdrop-blur transition-colors hover:bg-amber-200/10"
            >
              Barcha kurslarni ko'ring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="theme-hidden-vintage cv-auto bg-white py-16 dark:bg-black md:py-24">
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
            {ecosystemCards.map((card) => {
              const Icon =
                ecosystemIcons[card.iconKey as keyof typeof ecosystemIcons] ?? Sparkles;

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-[2rem] border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.15)] dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-500/50 dark:hover:bg-gray-900 dark:hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
              );
            })}
          </div>
        </div>
      </section>

      <VintageBentoEcosystem />

      <div className="theme-hidden-vintage">
        <MapSection />
      </div>
      <VintageGlobeSection />

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
