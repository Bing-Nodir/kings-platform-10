import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import { getMentorProfilesData } from "@/lib/content-store";

export const revalidate = 300;

export default async function MentorsPage() {
  const mentorProfiles = await getMentorProfilesData();

  return (
    <>
      <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_45%,#000000_100%)]">
        <section className="border-b border-gray-200/70 dark:border-gray-800">
          <div className="container mx-auto px-4 py-16 md:px-8 md:py-24">
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <Sparkles className="h-4 w-4" /> Core team
              </span>
              <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white md:text-6xl">
                Asoschilar va mentorlar jamoasi
              </h1>
              <p className="text-lg leading-8 text-gray-600 dark:text-gray-400">
                Platformadagi asosiy yo'nalishlar aynan shu real tajribaga ega mutaxassislar tomonidan shakllantirilgan va mentorlik qilinadi.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {mentorProfiles.map((mentor) => (
              <article
                key={mentor.name}
                className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                  {mentor.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <h2 className="mt-5 text-2xl font-black text-gray-950 dark:text-white">
                  {mentor.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {mentor.role}
                </p>
                <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {mentor.bio}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {mentor.expertise.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-3xl font-black text-gray-950 dark:text-white">
              Mentor bilan learning journey&apos;ni boshlashga tayyormisiz?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
              Sizga mos kursni tanlang yoki korporativ/offline format bo&apos;yicha jamoamiz bilan bog&apos;laning.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Kurslarni ko&apos;rish <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                Mentor bilan bog&apos;lanish
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
