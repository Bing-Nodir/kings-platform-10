"use client";

import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  PlayCircle,
  Settings2,
  SkipBack,
  SkipForward,
  UploadCloud,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonPlayerProps {
  title: string;
  summary: string;
  moduleTitle: string;
  duration: string;
  heroGradient: string;
  accessLabel: string;
  helperText: string;
  videoUrl?: string;
  videoMimeType?: string;
  uploadFilePath?: string;
}

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0:00";
  }

  const rounded = Math.floor(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function PlayerIconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
        className
      )}
    >
      {children}
    </button>
  );
}

function VideoPlaybackSurface({
  title,
  summary,
  moduleTitle,
  duration,
  accessLabel,
  helperText,
  videoUrl,
  videoMimeType,
}: Omit<LessonPlayerProps, "heroGradient" | "uploadFilePath">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideChromeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVolumeRef = useRef(0.8);

  const [failedVideoUrl, setFailedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showChrome, setShowChrome] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const canShowVideo = failedVideoUrl !== videoUrl;
  const playedPercent =
    durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  const clearHideTimer = () => {
    if (hideChromeTimerRef.current) {
      clearTimeout(hideChromeTimerRef.current);
      hideChromeTimerRef.current = null;
    }
  };

  const clearClickTimer = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  };

  const registerInteraction = () => {
    setShowChrome(true);
  };

  const stopInteractionPropagation = (
    event:
      | React.MouseEvent<HTMLElement>
      | React.PointerEvent<HTMLElement>
      | React.TouchEvent<HTMLElement>
  ) => {
    event.stopPropagation();
  };

  const syncBufferedProgress = () => {
    const video = videoRef.current;
    if (!video || !video.duration || video.buffered.length === 0) {
      setBufferedPercent(0);
      return;
    }

    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    setBufferedPercent((bufferedEnd / video.duration) * 100);
  };

  const syncTimeState = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setCurrentTime(video.currentTime);
    setDurationSeconds(Number.isFinite(video.duration) ? video.duration : 0);
    syncBufferedProgress();
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    registerInteraction();

    if (video.paused || video.ended) {
      if (video.ended) {
        video.currentTime = 0;
      }

      try {
        await video.play();
      } catch {
        setShowChrome(true);
      }
      return;
    }

    video.pause();
  };

  const seekTo = (nextTime: number) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const safeTime = clamp(nextTime, 0, durationSeconds || 0);
    video.currentTime = safeTime;
    setCurrentTime(safeTime);
  };

  const skipBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    seekTo(video.currentTime + delta);
  };

  const setVolumeLevel = (nextVolume: number) => {
    const video = videoRef.current;
    const safeVolume = clamp(nextVolume, 0, 1);

    setVolume(safeVolume);
    setIsMuted(safeVolume === 0);

    if (safeVolume > 0) {
      lastVolumeRef.current = safeVolume;
    }

    if (video) {
      video.volume = safeVolume;
      video.muted = safeVolume === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    registerInteraction();

    if (video.muted || video.volume === 0) {
      const restoredVolume = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.8;
      video.muted = false;
      video.volume = restoredVolume;
      setIsMuted(false);
      setVolume(restoredVolume);
      return;
    }

    lastVolumeRef.current = video.volume > 0 ? video.volume : lastVolumeRef.current;
    video.muted = true;
    setIsMuted(true);
  };

  const toggleFullscreen = async () => {
    registerInteraction();

    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
        return;
      }

      await document.exitFullscreen?.();
    } catch {
      setShowChrome(true);
    }
  };

  const handlePlaybackRateChange = (nextRate: number) => {
    const video = videoRef.current;
    setPlaybackRate(nextRate);

    if (video) {
      video.playbackRate = nextRate;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      clearClickTimer();
    };
  }, []);

  useEffect(() => {
    clearHideTimer();

    if (!isPlaying || !showChrome) {
      return;
    }

    hideChromeTimerRef.current = setTimeout(() => {
      setShowChrome(false);
    }, 2400);

    return clearHideTimer;
  }, [isPlaying, showChrome, isFullscreen]);

  useEffect(() => clearHideTimer, []);

  if (!videoUrl || !canShowVideo) {
    return (
      <div className="absolute inset-0 z-0 flex flex-col justify-between">
        <div className="pointer-events-none absolute inset-0 bg-black/45" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_35%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                {moduleTitle}
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-black md:text-4xl">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
                {summary}
              </p>
            </div>
            <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur md:inline-flex">
              {accessLabel}
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm text-white/75">
                Video hali yuklanmagan | {duration} | upload-ready slot
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm backdrop-blur md:block">
              <p className="font-semibold text-white">Sprint focus</p>
              <p className="mt-1 max-w-sm text-white/70">{helperText}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="group/player absolute inset-0 z-0 bg-black outline-none"
      onMouseMove={registerInteraction}
      onMouseEnter={registerInteraction}
      onTouchStart={registerInteraction}
      onClick={() => {
        containerRef.current?.focus();
        clearClickTimer();
        clickTimerRef.current = setTimeout(() => {
          void togglePlay();
        }, 180);
      }}
      onDoubleClick={() => {
        clearClickTimer();
        void toggleFullscreen();
      }}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        if (tagName === "input" || tagName === "select") {
          return;
        }

        const key = event.key.toLowerCase();
        if (key === " " || key === "k") {
          event.preventDefault();
          void togglePlay();
        } else if (key === "j") {
          event.preventDefault();
          skipBy(-10);
        } else if (key === "l") {
          event.preventDefault();
          skipBy(10);
        } else if (key === "arrowleft") {
          event.preventDefault();
          skipBy(-5);
        } else if (key === "arrowright") {
          event.preventDefault();
          skipBy(5);
        } else if (key === "arrowup") {
          event.preventDefault();
          setVolumeLevel(volume + 0.05);
        } else if (key === "arrowdown") {
          event.preventDefault();
          setVolumeLevel(volume - 0.05);
        } else if (key === "m") {
          event.preventDefault();
          toggleMute();
        } else if (key === "f") {
          event.preventDefault();
          void toggleFullscreen();
        } else if (/^[0-9]$/.test(key)) {
          event.preventDefault();
          const nextPercent = Number(key) / 10;
          seekTo((durationSeconds || 0) * nextPercent);
        }
      }}
    >
      <video
        ref={videoRef}
        key={videoUrl}
        playsInline
        preload="metadata"
        controls={false}
        controlsList="nodownload"
        className="absolute inset-0 h-full w-full object-cover"
        onLoadedMetadata={syncTimeState}
        onDurationChange={syncTimeState}
        onTimeUpdate={syncTimeState}
        onProgress={syncBufferedProgress}
        onSeeked={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onPlay={() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowChrome(true);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsBuffering(false);
          setShowChrome(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowChrome(true);
        }}
        onError={() => setFailedVideoUrl(videoUrl)}
        onVolumeChange={() => {
          const video = videoRef.current;
          if (!video) {
            return;
          }

          setIsMuted(video.muted);
          setVolume(video.muted ? 0 : video.volume);
        }}
        onRateChange={() => {
          const video = videoRef.current;
          if (video) {
            setPlaybackRate(video.playbackRate);
          }
        }}
      >
        <source src={videoUrl} type={videoMimeType ?? "video/mp4"} />
      </video>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/55 transition-opacity duration-200",
          showChrome || !isPlaying ? "opacity-100" : "opacity-30"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 p-5 text-white transition-opacity duration-200 md:p-6",
          showChrome || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
              {moduleTitle}
            </p>
            <h2 className="mt-2 text-2xl font-black md:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
              {summary}
            </p>
          </div>

          <div className="hidden flex-col items-end gap-2 md:flex">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              {accessLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              HD | {duration}
            </span>
          </div>
        </div>
      </div>

      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              clearClickTimer();
              void togglePlay();
            }}
            aria-label={currentTime > 0 ? "Videoni davom ettirish" : "Videoni ijro etish"}
            className="pointer-events-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-2xl backdrop-blur transition hover:scale-105 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <PlayCircle className="h-11 w-11" />
          </button>
        </div>
      )}

      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full border border-white/20 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
            Yuklanmoqda...
          </div>
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-30 p-4 transition-opacity duration-200 md:p-6",
          showChrome || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="pointer-events-auto rounded-[1.5rem] border border-white/10 bg-black/35 p-3 backdrop-blur-md md:p-4"
          onClick={stopInteractionPropagation}
          onPointerDown={stopInteractionPropagation}
          onTouchStart={stopInteractionPropagation}
        >
          <div className="mb-3">
            <div className="relative flex h-5 items-center">
              <div className="absolute h-1.5 w-full rounded-full bg-white/15" />
              <div
                className="absolute h-1.5 rounded-full bg-white/25"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute h-1.5 rounded-full bg-red-500"
                style={{ width: `${playedPercent}%` }}
              />
              <input
                type="range"
                min={0}
                max={durationSeconds || 0}
                step={0.1}
                value={currentTime}
                aria-label="Video pozitsiyasini boshqarish"
                onClick={stopInteractionPropagation}
                onPointerDown={stopInteractionPropagation}
                onTouchStart={stopInteractionPropagation}
                onChange={(event) => {
                  registerInteraction();
                  seekTo(Number(event.target.value));
                }}
                className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent accent-red-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <PlayerIconButton
                label={isPlaying ? "Pauza" : "Ijro etish"}
                onClick={() => {
                  void togglePlay();
                }}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </PlayerIconButton>

              <PlayerIconButton label="10 soniya orqaga" onClick={() => skipBy(-10)}>
                <SkipBack className="h-4 w-4" />
              </PlayerIconButton>

              <PlayerIconButton label="10 soniya oldinga" onClick={() => skipBy(10)}>
                <SkipForward className="h-4 w-4" />
              </PlayerIconButton>

              <PlayerIconButton label={isMuted ? "Ovoz yoqish" : "Ovozni o'chirish"} onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </PlayerIconButton>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                aria-label="Ovoz balandligi"
                onClick={stopInteractionPropagation}
                onPointerDown={stopInteractionPropagation}
                onTouchStart={stopInteractionPropagation}
                onChange={(event) => {
                  registerInteraction();
                  setVolumeLevel(Number(event.target.value));
                }}
                className="hidden h-2 w-24 cursor-pointer appearance-none rounded-full bg-white/15 accent-white md:block"
              />

              <div className="ml-1 text-sm font-medium text-white/90">
                {formatTime(currentTime)} / {formatTime(durationSeconds)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/70 lg:inline-flex">
                `K`, `J`, `L`, `M`, `F`
              </div>

              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80">
                <Settings2 className="h-4 w-4" />
                <select
                  value={playbackRate}
                  aria-label="Playback tezligi"
                  onClick={stopInteractionPropagation}
                  onPointerDown={stopInteractionPropagation}
                  onChange={(event) => {
                    registerInteraction();
                    handlePlaybackRateChange(Number(event.target.value));
                  }}
                  className="bg-transparent text-sm outline-none"
                >
                  {PLAYBACK_RATES.map((rate) => (
                    <option key={rate} value={rate} className="text-black">
                      {rate}x
                    </option>
                  ))}
                </select>
              </label>

              <PlayerIconButton
                label={isFullscreen ? "Fullscreen'dan chiqish" : "Fullscreen"}
                onClick={() => {
                  void toggleFullscreen();
                }}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </PlayerIconButton>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-white/65">
            <span>{helperText}</span>
            <span>{isPlaying ? "YouTube-style player mode" : "Boshlashga tayyor"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseLessonPlayer({
  title,
  summary,
  moduleTitle,
  duration,
  heroGradient,
  accessLabel,
  helperText,
  videoUrl,
  videoMimeType,
  uploadFilePath,
}: LessonPlayerProps) {
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${heroGradient}`}
    >
      {videoUrl ? (
        <VideoPlaybackSurface
          key={videoUrl}
          title={title}
          summary={summary}
          moduleTitle={moduleTitle}
          duration={duration}
          accessLabel={accessLabel}
          helperText={helperText}
          videoUrl={videoUrl}
          videoMimeType={videoMimeType}
        />
      ) : (
        <div className="absolute inset-0 z-0 flex flex-col justify-between">
          <div className="pointer-events-none absolute inset-0 bg-black/45" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_35%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  {moduleTitle}
                </p>
                <h2 className="mt-3 max-w-2xl text-2xl font-black md:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
                  {summary}
                </p>
              </div>
              <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur md:inline-flex">
                {accessLabel}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm text-white/75">
                  Video hali yuklanmagan | {duration} | upload-ready slot
                </p>
                {uploadFilePath ? (
                  <p className="mt-3 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-xs leading-6 text-white/80 backdrop-blur">
                    Video faylni shu path bo&apos;yicha joylang:
                    <br />
                    <span className="font-mono text-[11px] text-white">
                      {uploadFilePath}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="hidden rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm backdrop-blur md:block">
                <p className="font-semibold text-white">Sprint focus</p>
                <p className="mt-1 max-w-sm text-white/70">{helperText}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
