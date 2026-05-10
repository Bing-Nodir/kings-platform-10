import Link from "next/link";
import { ArrowRight, Building2, Sparkles, Users2 } from "lucide-react";
import Footer from "@/components/Footer";
import {
  getAboutPillarsData,
  getLiveCompanyStatsData,
  getMentorProfilesData,
} from "@/lib/content-store";

export const revalidate = 300;

const pillarIcons = {
  Users2,
  Building2,
  Sparkles,
} as const;

export default async function AboutPage() {
  const [companyStats, mentorProfiles, aboutPillars] = await Promise.all([
    getLiveCompanyStatsData(),
    getMentorProfilesData(),
    getAboutPillarsData(),
  ]);

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_50%,#000000_100%)]">
        <section className="border-b border-gray-200/70 dark:border-gray-800">
          <div className="container mx-auto px-4 py-16 md:px-8 md:py-24">
            <div className="max-w-4xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <Sparkles className="h-4 w-4" /> About Kings Education
              </span>
              <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white md:text-6xl">
                Biz kurs, mentor nazorati va oflayn learning touchpoint'larini bitta professional ekotizimga birlashtiryapmiz
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-400">
                Kings Education maqsadi oddiy: o'quvchi yo'nalishni tanlagan paytdan boshlab preview darslar, checkout, dashboard, mentor support va real natijagacha bo'lgan barcha bosqichlarni bir platformada boshqarish.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              {companyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/70"
                >
                  <p className="text-3xl font-black text-gray-950 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {aboutPillars.map((pillar) => {
              const Icon = pillarIcons[pillar.iconKey as keyof typeof pillarIcons] ?? Sparkles;

              return (
                <div
                  key={pillar.title}
                  className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <Icon className={`h-6 w-6 ${pillar.accentClass}`} />
                  <h2 className="mt-4 text-xl font-black text-gray-950 dark:text-white">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 md:px-8 md:pb-24">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Core team
                </p>
                <h2 className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
                  Asoschilar va mentorlar yondashuvi
                </h2>
              </div>
              <Link
                href="/mentors"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
              >
                Jamoani ko'rish <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {mentorProfiles.map((mentor) => (
                <div
                  key={mentor.name}
                  className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="text-lg font-bold text-gray-950 dark:text-white">
                    {mentor.name}
                  </p>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    {mentor.role}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {mentor.bio}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-black dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
