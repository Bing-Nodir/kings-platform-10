"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { GridPixelateWipe } from "@/components/ui/grid-pixelate-wipe";

const DURATION_IN_FRAMES = 76;

function BusinessScenePanel({ mode }: { mode: "before" | "after" }) {
  const isAfter = mode === "after";
  const background = isAfter
    ? "linear-gradient(135deg, #04111f 0%, #071b36 42%, #062f35 72%, #0d1424 100%)"
    : "linear-gradient(135deg, #020617 0%, #071225 48%, #0b172a 100%)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 28%, rgba(34, 211, 238, 0.18), transparent 34%), radial-gradient(circle at 64% 66%, rgba(250, 204, 21, 0.1), transparent 30%), linear-gradient(90deg, rgba(2,6,23,0.82), rgba(2,6,23,0.28) 48%, rgba(2,6,23,0.82))",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: isAfter ? 0.14 : 0.08,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.24) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(2,6,23,0.18) 42%, rgba(2,6,23,0.74) 100%)",
        }}
      />
    </div>
  );
}

function BusinessPixelateWipeScene() {
  return (
    <GridPixelateWipe
      cols={12}
      rows={7}
      pattern="wave"
      transitionStart={8}
      transitionDuration={32}
      cellFadeFrames={5}
      from={<BusinessScenePanel mode="before" />}
      to={<BusinessScenePanel mode="after" />}
    />
  );
}

export default function BusinessPixelateWipe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let retryTimeout: number | null = null;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const playEntrance = () => {
      if (!wasVisibleRef.current) {
        return;
      }

      const player = playerRef.current;
      if (!player) {
        if (retryTimeout !== null) {
          window.clearTimeout(retryTimeout);
        }
        retryTimeout = window.setTimeout(playEntrance, 50);
        return;
      }

      if (reducedMotion) {
        player.seekTo(DURATION_IN_FRAMES - 1);
        player.pause();
        return;
      }

      player.seekTo(0);
      player.play();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!wasVisibleRef.current) {
            wasVisibleRef.current = true;
            playEntrance();
          }
          return;
        }

        wasVisibleRef.current = false;
        playerRef.current?.pause();
      },
      { threshold: 0.45 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden bg-[#020617]">
      <div className="absolute left-1/2 top-1/2 aspect-video h-full min-w-full -translate-x-1/2 -translate-y-1/2">
        <Player
          ref={playerRef}
          component={BusinessPixelateWipeScene}
          durationInFrames={DURATION_IN_FRAMES}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          controls={false}
          autoPlay={false}
          loop={false}
          clickToPlay={false}
          acknowledgeRemotionLicense
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
