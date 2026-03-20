"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

// Re-render bo'lmasligi uchun map'ni komponentdan tashqarida generatsiya qilamiz
const map = new DottedMap({ height: 100, grid: "diagonal" });

const svgMapLight = map.getSVG({
  radius: 0.22,
  color: "#00000040",
  shape: "circle",
  backgroundColor: "white",
});

const svgMapDark = map.getSVG({
  radius: 0.22,
  color: "#FFFFFF40",
  shape: "circle",
  backgroundColor: "black",
});

export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="relative aspect-[2/1] w-full rounded-lg bg-white font-sans dark:bg-black">
      {/* Light Mode Xaritasi */}
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMapLight)}`}
        className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] dark:hidden"
        alt="world map light"
        height="495"
        width="1056"
        draggable={false}
      />
      {/* Dark Mode Xaritasi */}
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMapDark)}`}
        className="pointer-events-none hidden h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] dark:block"
        alt="world map dark"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="absolute inset-0 h-full w-full pointer-events-none select-none"
      >
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 0.7 }
                    : {
                        pathLength: [0, 1, 1],
                        opacity: [0, 1, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.8, delay: 0.12 * i, ease: "easeOut" }
                    : {
                        duration: 2.5,
                        delay: 0.5 * i,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }
                }
                key={`start-upper-${i}`}
              ></motion.path>
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                fill={lineColor}
              />
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                {!prefersReducedMotion && (
                  <>
                    <animate attributeName="r" from="2" to="8" dur="1.5s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
                  </>
                )}
              </circle>
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                fill={lineColor}
              />
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                {!prefersReducedMotion && (
                  <>
                    <animate attributeName="r" from="2" to="8" dur="1.5s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
                  </>
                )}
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
