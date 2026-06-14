"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Globe } from "@/components/ui/cobe-globe";

const markers = [
  {
    id: "tashkent",
    location: [41.2995, 69.2401] as [number, number],
    label: "NODE:TAS",
  },
  {
    id: "dubai",
    location: [25.2048, 55.2708] as [number, number],
    label: "DXB:RELAY",
  },
  {
    id: "singapore",
    location: [1.3521, 103.8198] as [number, number],
    label: "SIN:EDGE",
  },
  {
    id: "seoul",
    location: [37.5665, 126.978] as [number, number],
    label: "SEL:AI",
  },
  {
    id: "tokyo",
    location: [35.6762, 139.6503] as [number, number],
    label: "TYO:DATA",
  },
  {
    id: "frankfurt",
    location: [50.1109, 8.6821] as [number, number],
    label: "FRA:CORE",
  },
  {
    id: "london",
    location: [51.5074, -0.1278] as [number, number],
    label: "LON:CLOUD",
  },
  {
    id: "newyork",
    location: [40.7128, -74.006] as [number, number],
    label: "NYC:SYNC",
  },
  {
    id: "sf",
    location: [37.7749, -122.4194] as [number, number],
    label: "SFO:LAB",
  },
];

const arcs = [
  {
    id: "tas-dxb",
    from: [41.2995, 69.2401] as [number, number],
    to: [25.2048, 55.2708] as [number, number],
    label: "TLS 38MS",
  },
  {
    id: "tas-sin",
    from: [41.2995, 69.2401] as [number, number],
    to: [1.3521, 103.8198] as [number, number],
    label: "STREAM",
  },
  {
    id: "sin-tyo",
    from: [1.3521, 103.8198] as [number, number],
    to: [35.6762, 139.6503] as [number, number],
    label: "PACKET",
  },
  {
    id: "sel-fra",
    from: [37.5665, 126.978] as [number, number],
    to: [50.1109, 8.6821] as [number, number],
    label: "VECTOR",
  },
  {
    id: "fra-lon",
    from: [50.1109, 8.6821] as [number, number],
    to: [51.5074, -0.1278] as [number, number],
    label: "AUTH",
  },
  {
    id: "lon-nyc",
    from: [51.5074, -0.1278] as [number, number],
    to: [40.7128, -74.006] as [number, number],
    label: "SYNC",
  },
  {
    id: "nyc-sfo",
    from: [40.7128, -74.006] as [number, number],
    to: [37.7749, -122.4194] as [number, number],
    label: "MODEL",
  },
  {
    id: "sfo-tas",
    from: [37.7749, -122.4194] as [number, number],
    to: [41.2995, 69.2401] as [number, number],
    label: "RETURN",
  },
];

const terminalLines = [
  "handshake::tas -> sin // latency 42ms",
  "stream::ai_mentor.vector.sync",
  "packet::course.progress.hash verified",
  "route::payment.rail encrypted",
  "edge::portfolio.deploy ready",
  "trace::student.node authenticated",
  "signal::global.cohort online",
  "model::feedback.loop active",
];

const floatingTerminals = [
  { text: "root@kings:~$ tunnel --open", className: "left-[7%] top-[18%]" },
  { text: "AUTH_OK 2048bit // session alive", className: "right-[6%] top-[24%]" },
  { text: "VECTOR MAP: 91.7% aligned", className: "left-[9%] bottom-[28%]" },
  { text: "TLS RELAY: TAS.DXB.SIN", className: "right-[8%] bottom-[22%]" },
  { text: "AI_MENTOR :: token stream", className: "left-1/2 top-[10%] -translate-x-1/2" },
];

export default function VintageGlobeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeLine, setActiveLine] = useState(0);
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
    target: sectionRef,
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.24, 0.72, 1],
    [0.76, 1.04, 1.16, 1.1]
  );
  const y = useTransform(scrollYProgress, [0, 0.32, 0.78, 1], [74, 0, 0, 22]);
  const opacity = useTransform(scrollYProgress, [0, 0.14, 0.9, 1], [0, 1, 1, 0.96]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLine((current) => (current + 1) % terminalLines.length);
    }, 1400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="theme-only-vintage relative -mt-px min-h-[126svh] overflow-clip bg-[#040302] text-stone-100 md:min-h-[132svh]"
    >
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(216,168,79,0.2),transparent_25%),radial-gradient(circle_at_50%_58%,rgba(20,184,166,0.13),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_28%,rgba(0,0,0,0.62)_76%,#020201_100%),linear-gradient(180deg,#0d0906_0%,#050302_36%,#010101_100%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(216,168,79,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_24%,rgba(216,168,79,0.55)_0_1px,transparent_1.5px),radial-gradient(circle_at_76%_22%,rgba(103,232,249,0.42)_0_1px,transparent_1.5px),radial-gradient(circle_at_62%_76%,rgba(216,168,79,0.32)_0_1px,transparent_1.5px),radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.22)_0_1px,transparent_1.5px)] [background-size:180px_180px,230px_230px,270px_270px,310px_310px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0d0906] via-[#070403]/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <motion.div
          className="relative grid h-[min(94svh,980px)] w-full max-w-6xl place-items-center px-4"
          style={{ opacity, scale, y }}
        >
          <div className="absolute h-[min(92vw,860px)] w-[min(92vw,860px)] rounded-full border border-amber-200/10 shadow-[0_0_160px_rgba(216,168,79,0.18),inset_0_0_110px_rgba(20,184,166,0.08)]" />
          <div className="vintage-deep-orbit absolute h-[min(105vw,980px)] w-[min(105vw,980px)] rounded-full border border-cyan-300/10" />
          <div className="vintage-orbit absolute h-[min(82vw,780px)] w-[min(82vw,780px)] rounded-full border border-dashed border-cyan-300/18" />
          <div className="vintage-orbit-reverse absolute h-[min(68vw,650px)] w-[min(68vw,650px)] rounded-full border border-dashed border-amber-200/18" />

          <div className="relative mx-auto w-[min(90vw,760px)]">
            <div className="absolute inset-8 rounded-full bg-cyan-300/10 blur-3xl" />
            <Globe
              arcColor={[0.18, 0.98, 0.85]}
              arcHeight={0.38}
              arcWidth={1.05}
              arcs={arcs}
              baseColor={[0.64, 0.55, 0.38]}
              className="relative mx-auto w-full"
              dark={1}
              diffuse={2}
              glowColor={[0.94, 0.66, 0.24]}
              mapBrightness={4.8}
              mapSamples={22000}
              markerColor={[0.96, 0.72, 0.28]}
              markerElevation={0.035}
              markerSize={0.034}
              markers={markers}
              speed={0.006}
              theta={0.17}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {floatingTerminals.map((item, index) => (
              <div
                key={item.text}
                className={`vintage-terminal absolute rounded-lg border border-cyan-300/20 bg-black/45 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-200/80 shadow-[0_0_30px_rgba(20,184,166,0.12)] backdrop-blur ${item.className}`}
                style={{ animationDelay: `${index * 0.45}s` }}
              >
                {item.text}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-[clamp(2.5rem,7svh,5.5rem)] left-1/2 w-[min(88vw,760px)] -translate-x-1/2 overflow-hidden rounded-xl border border-amber-200/15 bg-black/55 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-amber-100/85 shadow-[0_0_60px_rgba(216,168,79,0.12)] backdrop-blur md:text-sm">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)]" />
              <span className="vintage-terminal-line inline-block">
                {terminalLines[activeLine]}
              </span>
            </div>
          </div>

          <div className="vintage-scan pointer-events-none absolute inset-x-0 h-px bg-cyan-200/35 shadow-[0_0_24px_rgba(103,232,249,0.75)]" />
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes vintage-deep-orbit {
          from {
            transform: rotateX(78deg) rotateY(-12deg) rotateZ(0deg) scale(1);
          }
          to {
            transform: rotateX(78deg) rotateY(-12deg) rotateZ(-360deg) scale(1);
          }
        }

        @keyframes vintage-orbit {
          from {
            transform: rotateX(68deg) rotateZ(0deg);
          }
          to {
            transform: rotateX(68deg) rotateZ(360deg);
          }
        }

        @keyframes vintage-orbit-reverse {
          from {
            transform: rotateX(72deg) rotateY(16deg) rotateZ(360deg);
          }
          to {
            transform: rotateX(72deg) rotateY(16deg) rotateZ(0deg);
          }
        }

        @keyframes vintage-terminal {
          0%,
          100% {
            opacity: 0.42;
            transform: translate3d(0, 0, 0);
          }
          50% {
            opacity: 1;
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes vintage-scan {
          0% {
            top: 12%;
            opacity: 0;
          }
          18%,
          78% {
            opacity: 1;
          }
          100% {
            top: 88%;
            opacity: 0;
          }
        }

        @keyframes vintage-terminal-line {
          0% {
            opacity: 0;
            filter: blur(4px);
            transform: translateX(-10px);
          }
          18%,
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0);
          }
        }

        .vintage-deep-orbit {
          animation: vintage-deep-orbit 38s linear infinite;
          transform-style: preserve-3d;
        }

        .vintage-orbit {
          animation: vintage-orbit 22s linear infinite;
          transform-style: preserve-3d;
        }

        .vintage-orbit-reverse {
          animation: vintage-orbit-reverse 28s linear infinite;
          transform-style: preserve-3d;
        }

        .vintage-terminal {
          animation: vintage-terminal 3.2s ease-in-out infinite;
        }

        .vintage-terminal-line {
          animation: vintage-terminal-line 0.45s ease both;
        }

        .vintage-scan {
          animation: vintage-scan 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .vintage-orbit,
          .vintage-deep-orbit,
          .vintage-orbit-reverse,
          .vintage-terminal,
          .vintage-terminal-line,
          .vintage-scan {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
