"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Palette, Sparkles, Sun } from "lucide-react";
import { MouseEvent, useEffect, useSyncExternalStore, useState } from "react";
import {
  THEME_EVENT,
  applyThemePreference,
  getStoredThemePreference,
  resolveThemePreference,
  toggleThemePreference,
} from "@/lib/theme";

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return "light";
  }

  return resolveThemePreference(getStoredThemePreference());
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_EVENT, handleChange);
  mediaQuery.addEventListener("change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
    mediaQuery.removeEventListener("change", handleChange);
  };
}

function subscribeToMount() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const currentTheme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    () => "light"
  );
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
    toggleThemePreference();
  };

  useEffect(() => {
    applyThemePreference(getStoredThemePreference());
  }, []);

  useEffect(() => {
    if (ripples.length === 0) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [ripples]);

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white/80 text-gray-800 shadow-xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95 dark:border-gray-800 dark:bg-gray-950/80 dark:text-gray-200 sm:bottom-6 sm:right-6"
      aria-label="Sayt theme rejimini almashtirish"
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute rounded-full bg-black dark:bg-white"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              x: "-50%",
              y: "-50%",
            }}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        {!mounted ? (
          <div className="h-5 w-5" />
        ) : currentTheme === "vintage" ? (
          <Palette className="h-5 w-5 text-amber-500" />
        ) : currentTheme === "midnight" ? (
          <Sparkles className="h-5 w-5 text-cyan-400" />
        ) : currentTheme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-blue-600" />
        )}
      </span>
    </button>
  );
}
