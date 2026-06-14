"use client";

import { type CSSProperties, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

export function WordsPullUp({
  text,
  className = "",
  showAsterisk = false,
  style,
}: WordsPullUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={cn("inline-flex flex-wrap", className)} style={style}>
      {words.map((word, index) => {
        const isLast = index === words.length - 1;

        return (
          <motion.span
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            className="relative inline-block"
            initial={{ y: 20, opacity: 0 }}
            key={`${word}-${index}`}
            style={{ marginRight: isLast ? 0 : "0.25em" }}
            transition={{
              duration: 0.6,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {showAsterisk && isLast ? (
              <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">
                *
              </span>
            ) : null}
          </motion.span>
        );
      })}
    </div>
  );
}

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: CSSProperties;
}

export function WordsPullUpMultiStyle({
  segments,
  className = "",
  style,
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = segments.flatMap((segment) =>
    segment.text
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ word, className: segment.className }))
  );

  return (
    <div
      ref={ref}
      className={cn("inline-flex flex-wrap justify-center", className)}
      style={style}
    >
      {words.map((item, index) => (
        <motion.span
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          className={cn("inline-block", item.className)}
          initial={{ y: 20, opacity: 0 }}
          key={`${item.word}-${index}`}
          style={{ marginRight: "0.25em" }}
          transition={{
            duration: 0.6,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {item.word}
        </motion.span>
      ))}
    </div>
  );
}

interface PrismaHeroNavItem {
  label: string;
  href: string;
}

interface PrismaHeroProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  videoSrc?: string;
  navItems?: PrismaHeroNavItem[];
  showNav?: boolean;
  className?: string;
}

const defaultNavItems: PrismaHeroNavItem[] = [
  { label: "Kurslar", href: "/courses" },
  { label: "Do'kon", href: "/shop" },
  { label: "Biznes", href: "/business" },
  { label: "Ofislar", href: "/offices" },
];

export function PrismaHero({
  title = "Kings",
  description = "Kings Education - zamonaviy online kurslar, AI yordamchilar va real amaliyotga tayangan premium ta'lim platformasi.",
  ctaLabel = "Kurslarni ko'rish",
  ctaHref = "/courses",
  videoSrc = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4",
  navItems = defaultNavItems,
  showNav = true,
  className,
}: PrismaHeroProps) {
  return (
    <section
      className={cn(
        "relative min-h-[calc(100svh-5rem)] w-full overflow-hidden bg-[#14110b] text-[#e8dfc8] sm:min-h-[calc(100svh-6rem)]",
        className
      )}
    >
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 h-full w-full object-cover opacity-72"
        loop
        muted
        playsInline
        src={videoSrc}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_18%,rgba(232,223,200,0.12),transparent_32%),linear-gradient(180deg,rgba(8,6,3,0.36)_0%,rgba(9,7,4,0.58)_46%,rgba(4,3,2,0.92)_100%)]" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.38] mix-blend-overlay" />

      {showNav ? (
        <nav className="absolute left-1/2 top-0 z-20 hidden -translate-x-1/2 md:block">
          <div className="flex items-center gap-8 rounded-b-3xl bg-black/85 px-8 py-2.5 backdrop-blur">
            {navItems.map((item) => (
              <Link
                className="text-sm font-medium text-[#e1e0cc]/80 transition-colors hover:text-[#e1e0cc]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[clamp(2rem,6svh,4.5rem)] sm:px-6 md:px-10">
        <div className="grid grid-cols-12 items-end gap-5">
          <div className="col-span-12 lg:col-span-8">
            <h1
              aria-label={title}
              className="relative text-[clamp(5rem,18vw,15rem)] font-semibold leading-[0.82] text-[#f3ead6] sm:text-[clamp(7rem,18vw,16rem)]"
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', var(--font-geist-sans), serif",
                textShadow:
                  "0 2px 0 rgba(255,255,255,0.06), 0 26px 70px rgba(0,0,0,0.62)",
              }}
            >
              <span className="pointer-events-none absolute -inset-x-2 bottom-[0.04em] h-px bg-gradient-to-r from-transparent via-[#e8dfc8]/35 to-transparent" />
              <WordsPullUp text={title} />
            </h1>
          </div>

          <div className="col-span-12 flex flex-col gap-5 pb-1 lg:col-span-4 lg:pb-10">
            <motion.p
              animate={{ y: 0, opacity: 1 }}
              className="max-w-xl text-sm leading-6 text-[#e8dfc8]/78 md:text-base"
              initial={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {description}
            </motion.p>

            <motion.div
              animate={{ y: 0, opacity: 1 }}
              initial={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                className="group inline-flex items-center gap-2 self-start rounded-full bg-[#e8dfc8] py-1 pl-5 pr-1 text-sm font-semibold text-[#11100b] shadow-[0_14px_40px_rgba(0,0,0,0.3)] transition-all hover:gap-3 sm:text-base"
                href={ctaHref}
              >
                {ctaLabel}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-[#e8dfc8]" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
