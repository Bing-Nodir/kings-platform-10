"use client";

import Link from "next/link";
import { ArrowRight, Blocks, Zap } from "lucide-react";
import {
  siAirtable,
  siCoursera,
  siDocker,
  siFigma,
  siGithub,
  siGoogle,
  siGoogleanalytics,
  siNotion,
  siPostgresql,
  siPython,
  siReact,
  siSupabase,
  siTrello,
  siUdemy,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IntegrationLogo = {
  color: string;
  label: string;
  path: string;
  viewBox?: string;
};

type IntegrationHeroProps = {
  className?: string;
};

const OPENAI_LOGO: IntegrationLogo = {
  color: "#00A67E",
  label: "OpenAI",
  path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.0192 19.818a5.9847 5.9847 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.735-7.0969zM13.2599 22.4292a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4945zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM1.2824 9.2236a4.4849 4.4849 0 0 1 2.341-2.003l-.0047.1614v5.5181a.7948.7948 0 0 0 .3927.6813l5.8428 3.3685-1.0053 1.7434a.071.071 0 0 1-.0664.0332l-4.839-2.7914a4.504 4.504 0 0 1-2.6603-6.7065zm10.598-4.4447a4.4802 4.4802 0 0 1 2.881 1.0454l-.1419.08-4.783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.0804.0804 0 0 1-.0332-.0615v-5.568a4.4992 4.4992 0 0 1 4.4904-4.5037zm2.5904 6.3829-3.23-1.8624 3.23-1.8624 3.23 1.8624-3.23 1.8624zm-1.2215 4.4981-3.23-1.8624v-3.7245l3.23 1.8624v3.7245zm9.2962-2.3101a4.4708 4.4708 0 0 1-.5346 3.0137l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685v-2.3324a.0804.0804 0 0 1 .0332-.0615l4.839-2.7914a4.4992 4.4992 0 0 1 6.1408 1.6465z",
  viewBox: "0 0 24 24",
};

function fromSimpleIcon(icon: SimpleIcon): IntegrationLogo {
  return {
    color: `#${icon.hex}`,
    label: icon.title,
    path: icon.path,
    viewBox: "0 0 24 24",
  };
}

const ICONS_ROW1: IntegrationLogo[] = [
  OPENAI_LOGO,
  fromSimpleIcon(siGithub),
  fromSimpleIcon(siVercel),
  fromSimpleIcon(siSupabase),
  fromSimpleIcon(siReact),
  fromSimpleIcon(siPython),
  fromSimpleIcon(siPostgresql),
];

const ICONS_ROW2: IntegrationLogo[] = [
  fromSimpleIcon(siGoogle),
  fromSimpleIcon(siGoogleanalytics),
  fromSimpleIcon(siFigma),
  fromSimpleIcon(siNotion),
  fromSimpleIcon(siAirtable),
  fromSimpleIcon(siTrello),
  fromSimpleIcon(siDocker),
  fromSimpleIcon(siCoursera),
  fromSimpleIcon(siUdemy),
];

function repeatedIcons(icons: IntegrationLogo[], repeat = 4) {
  return Array.from({ length: repeat }).flatMap(() => icons);
}

function LogoPill({ logo }: { logo: IntegrationLogo }) {
  return (
    <div
      aria-label={`${logo.label} integratsiyasi`}
      className="group flex h-16 min-w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-200/15 bg-stone-950/80 text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.32)] ring-1 ring-white/[0.04] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-200/35 hover:bg-stone-900 hover:shadow-[0_24px_60px_rgba(216,168,79,0.16)] sm:h-[76px] sm:min-w-[76px]"
      role="img"
      title={logo.label}
    >
      <svg
        aria-hidden="true"
        className="h-8 w-8 transition duration-300 group-hover:scale-110 sm:h-10 sm:w-10"
        role="presentation"
        style={{ color: logo.color }}
        viewBox={logo.viewBox ?? "0 0 24 24"}
      >
        <path d={logo.path} fill="currentColor" />
      </svg>
    </div>
  );
}

function LogoRow({
  icons,
  reverse = false,
}: {
  icons: IntegrationLogo[];
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-max gap-5 whitespace-nowrap sm:gap-7",
        reverse ? "integration-scroll-right" : "integration-scroll-left"
      )}
    >
      {repeatedIcons(icons).map((logo, index) => (
        <LogoPill key={`${logo.label}-${index}`} logo={logo} />
      ))}
    </div>
  );
}

export default function IntegrationHero({ className }: IntegrationHeroProps) {
  return (
    <section
      className={cn(
        "cv-auto relative overflow-hidden bg-[#0d0906] py-16 text-stone-100 md:py-24",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,168,79,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute left-1/2 top-0 h-64 w-[min(72rem,85vw)] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,9,6,0.2),rgba(13,9,6,0.84)_76%,#0d0906)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#090603]/70 to-[#040302]" />

      <div className="container relative mx-auto px-4 text-center md:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-stone-950/70 px-4 py-2 text-sm font-semibold text-amber-200 shadow-[0_18px_55px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.04] backdrop-blur">
          <Blocks className="h-4 w-4" />
          Kings ekotizimi
        </span>

        <h2 className="mx-auto mt-5 max-w-5xl text-balance text-4xl font-black tracking-tight text-stone-50 sm:text-5xl lg:text-6xl">
          Platforma sevimli vositalaringiz bilan bir oqimda ishlaydi
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-300/82 sm:text-lg">
          AI Mentor, kurslar, analytics, to'lov, portfolio va instructor
          workflowlarini Kings ichida premium integratsiya sifatida ulang.
        </p>

        <Button
          asChild
          className="mt-8 h-12 rounded-full bg-amber-300 px-6 text-sm font-black text-stone-950 shadow-[0_18px_50px_rgba(216,168,79,0.2)] hover:bg-amber-200"
          size="lg"
        >
          <Link href="/business">
            Biznes yechimlarni ko'rish
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <div className="relative mx-auto mt-12 max-w-6xl overflow-hidden pb-3 pt-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="space-y-5">
            <LogoRow icons={ICONS_ROW1} />
            <LogoRow icons={ICONS_ROW2} reverse />
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
          {[
            ["250+", "ulanishga tayyor vositalar"],
            ["24/7", "AI yordamchi va monitoring"],
            ["1 oqim", "kurs, do'kon va mentorlik"],
          ].map(([value, label]) => (
            <div
              key={value}
              className="rounded-2xl border border-amber-200/12 bg-stone-950/55 p-5 ring-1 ring-white/[0.03] backdrop-blur"
            >
              <div className="flex items-center gap-2 text-2xl font-black text-stone-50">
                <Zap className="h-4 w-4 text-amber-300" />
                {value}
              </div>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-stone-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes integration-scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes integration-scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .integration-scroll-left {
          animation: integration-scroll-left 34s linear infinite;
        }

        .integration-scroll-right {
          animation: integration-scroll-right 34s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .integration-scroll-left,
          .integration-scroll-right {
            animation-duration: 90s;
          }
        }
      `}</style>
    </section>
  );
}
