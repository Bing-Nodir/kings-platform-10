"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, BookOpen, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import Link from "next/link";

type Point = {
  x: number;
  y: number;
};

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

interface MotionProfile {
  reducedMotion: boolean;
  finePointer: boolean;
  compactViewport: boolean;
  waveStep: number;
  waveLimit: number;
  mouseInfluence: number;
  influenceRadius: number;
  smoothing: number;
  shadowBlur: number;
}

const getMotionProfile = (): MotionProfile => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const compactViewport = window.innerWidth < 1024;

  return {
    reducedMotion,
    finePointer,
    compactViewport,
    waveStep: reducedMotion ? 12 : compactViewport ? 8 : 4,
    waveLimit: reducedMotion ? 2 : compactViewport ? 3 : 5,
    mouseInfluence: reducedMotion ? 8 : compactViewport ? 24 : 70,
    influenceRadius: reducedMotion ? 140 : compactViewport ? 180 : 320,
    smoothing: reducedMotion ? 0.035 : compactViewport ? 0.06 : 0.1,
    shadowBlur: reducedMotion ? 12 : compactViewport ? 20 : 35,
  };
};

const highlightPills = [
  "Zamonaviy kasblar",
  "AI Mentor 24/7",
  "Amaliy loyihalar",
] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
  },
};

interface GlowyWavesHeroProps {
  stats?: { label: string; value: string }[];
  badgeText?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  description?: string;
}

export function GlowyWavesHero({
  stats = [
    { label: "Faol O'quvchilar", value: "10k+" },
    { label: "Oflayn Markazlar", value: "5+" },
    { label: "O'qituvchilar", value: "50+" },
  ],
  badgeText = "Kelajak ta'limiga xush kelibsiz",
  titlePrefix = "O'z kelajagingizni",
  titleHighlight = "AI Ta'limi bilan quring",
  description = "Kings Education - eng ilg'or online kurslar, sun'iy intellekt yordamchilari va to'liq integratsiyalashgan do'konni o'zida jamlagan platforma.",
}: GlowyWavesHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationId: number;
    let time = 0;
    let isVisible = !document.hidden;
    let motionProfile = getMotionProfile();

    const computeThemeColors = () => {
      const rootStyles = getComputedStyle(document.documentElement);

      const resolveColor = (variables: string[], alpha = 1) => {
        const tempEl = document.createElement("div");
        tempEl.style.position = "absolute";
        tempEl.style.visibility = "hidden";
        tempEl.style.width = "1px";
        tempEl.style.height = "1px";
        document.body.appendChild(tempEl);

        let color = `rgba(255, 255, 255, ${alpha})`;

        for (const variable of variables) {
          const value = rootStyles.getPropertyValue(variable).trim();
          if (value) {
            tempEl.style.backgroundColor = `var(${variable})`;
            const computedColor = getComputedStyle(tempEl).backgroundColor;

            if (computedColor && computedColor !== "rgba(0, 0, 0, 0)") {
              if (alpha < 1) {
                const rgbMatch = computedColor.match(
                  /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
                );
                if (rgbMatch) {
                  color = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
                } else {
                  color = computedColor;
                }
              } else {
                color = computedColor;
              }
              break;
            }
          }
        }

        document.body.removeChild(tempEl);
        return color;
      };

      return {
        backgroundTop: resolveColor(["--background"], 1),
        backgroundBottom: resolveColor(["--muted", "--background"], 0.95),
        wavePalette: [
          {
            offset: 0,
            amplitude: 70,
            frequency: 0.003,
            color: resolveColor(["--hero-wave-1"], 1),
            opacity: 0.45,
          },
          {
            offset: Math.PI / 2,
            amplitude: 90,
            frequency: 0.0026,
            color: resolveColor(["--hero-wave-2"], 1),
            opacity: 0.35,
          },
          {
            offset: Math.PI,
            amplitude: 60,
            frequency: 0.0034,
            color: resolveColor(["--hero-wave-3"], 1),
            opacity: 0.3,
          },
          {
            offset: Math.PI * 1.5,
            amplitude: 80,
frequency: 0.0022,
            color: resolveColor(["--hero-wave-4"], 1),
            opacity: 0.25,
          },
          {
            offset: Math.PI * 2,
            amplitude: 55,
frequency: 0.004,
            color: resolveColor(["--hero-wave-5"], 1),
            opacity: 0.2,
          },
        ] satisfies WaveConfig[],
      };
    };

    let themeColors = computeThemeColors();

    const handleThemeMutation = () => {
      themeColors = computeThemeColors();
    };

    const observer = new MutationObserver(handleThemeMutation);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const recenterMouse = () => {
      const centerPoint = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = centerPoint;
      targetMouseRef.current = centerPoint;
    };

    const handleResize = () => {
      motionProfile = getMotionProfile();
      resizeCanvas();
      recenterMouse();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!motionProfile.finePointer) return;
      targetMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerLeave = () => {
      recenterMouse();
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    resizeCanvas();
    recenterMouse();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const drawWave = (wave: WaveConfig) => {
      ctx.save();
      ctx.beginPath();

      for (let x = 0; x <= canvas.width; x += motionProfile.waveStep) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / motionProfile.influenceRadius);
        const mouseEffect =
          influence *
          motionProfile.mouseInfluence *
          Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) *
            wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) *
            (wave.amplitude * 0.45) +
          mouseEffect;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = motionProfile.shadowBlur;
      ctx.shadowColor = wave.color;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      if (!isVisible) {
        return;
      }

      time += 1;

      mouseRef.current.x +=
        (targetMouseRef.current.x - mouseRef.current.x) * motionProfile.smoothing;
      mouseRef.current.y +=
        (targetMouseRef.current.y - mouseRef.current.y) * motionProfile.smoothing;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, themeColors.backgroundTop);
      gradient.addColorStop(1, themeColors.backgroundBottom);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      themeColors.wavePalette
        .slice(0, motionProfile.waveLimit)
        .forEach(drawWave);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-5rem)] w-full items-center justify-center overflow-hidden bg-background sm:min-h-[calc(100svh-6rem)]"
      role="region"
      aria-label="Kings Education hero section"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground/[0.035] blur-[140px] dark:bg-foreground/[0.06]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[120px] dark:bg-foreground/[0.05]" />
        <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/[0.05] blur-[150px] dark:bg-blue-500/[0.1]" />
      </div>

      <div className="relative z-[60] mx-auto flex w-full max-w-6xl pointer-events-auto flex-col items-center px-6 py-[clamp(2.5rem,7svh,5.5rem)] text-center md:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/70 backdrop-blur-sm dark:border-border/60 dark:bg-background/70 dark:text-foreground/80"
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            {badgeText}
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-balance text-[clamp(2.35rem,7vw,4.75rem)] font-extrabold leading-[1.04] tracking-tight text-foreground"
          >
            {titlePrefix}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 w-full max-w-[22rem] text-balance text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-foreground/70 sm:max-w-3xl"
          >
            {description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="relative z-[80] mb-12 flex pointer-events-auto flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/courses"
              aria-label="Kurslar sahifasini ochish"
              className="relative z-[100] group inline-flex h-14 w-full max-w-[22rem] items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 cursor-pointer sm:w-auto sm:px-8"
            >
              <BookOpen className="h-5 w-5" />
              Kurslarni ko&apos;rish
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/shop"
              aria-label="Do'kon sahifasini ochish"
              className="relative z-[100] inline-flex h-14 w-full max-w-[22rem] items-center justify-center gap-2 rounded-full border border-border/40 bg-background/60 px-6 text-base font-semibold text-foreground/80 shadow-lg backdrop-blur transition-all hover:bg-background/70 active:scale-95 dark:border-border/50 dark:bg-background/40 dark:text-foreground/70 dark:hover:bg-background/50 cursor-pointer sm:w-auto sm:px-8"
            >
              <ShoppingBag className="h-5 w-5" />
              Do'kon
            </Link>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mb-12 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.1em] text-foreground/70 dark:text-foreground/80"
          >
            {highlightPills.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-border/40 bg-background/60 px-5 py-2.5 font-medium backdrop-blur dark:border-border/60 dark:bg-background/70"
              >
                {pill}
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={statsVariants}
            className="grid w-full max-w-[22rem] gap-4 rounded-3xl border border-border/30 bg-background/40 p-5 backdrop-blur-md dark:border-border/60 dark:bg-background/40 min-[560px]:max-w-3xl min-[560px]:grid-cols-3 sm:p-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="space-y-1"
              >
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-[0.1em] text-foreground/60 dark:text-foreground/50 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
