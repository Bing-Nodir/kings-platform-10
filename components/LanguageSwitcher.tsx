"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { LOCALE_FLAGS, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

const LOCALES: Locale[] = ["uz", "ru", "en"];

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  compact = false,
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 text-sm font-medium text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        aria-label="Tilni tanlash"
      >
        <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
        {!compact && (
          <span className="hidden sm:inline text-xs">{LOCALE_LABELS[locale]}</span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-40 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                locale === loc
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "text-foreground"
              }`}
            >
              <span className="text-base">{LOCALE_FLAGS[loc]}</span>
              <span>{LOCALE_LABELS[loc]}</span>
              {locale === loc && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
