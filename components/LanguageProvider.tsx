"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (section: keyof typeof translations.uz, key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "uz",
  setLocale: () => {},
  t: (_section, key) => key,
});

const STORAGE_KEY = "kings_locale";
const LOCALE_EVENT = "kings-locale-change";
const supportedLocales = new Set<Locale>(["uz", "ru", "en"]);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "uz";
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && supportedLocales.has(stored)) {
      return stored;
    }
  } catch {
    // localStorage not available (SSR/privacy mode)
  }

  return "uz";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(LOCALE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LOCALE_EVENT, handleChange);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribe,
    getStoredLocale,
    () => "uz"
  );

  function setLocale(newLocale: Locale) {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      window.dispatchEvent(new Event(LOCALE_EVENT));
    } catch {
      // ignore
    }
  }

  function t(section: keyof typeof translations.uz, key: string): string {
    const sectionData = translations[locale]?.[section] as
      | Record<string, unknown>
      | undefined;
    if (sectionData && typeof sectionData[key] === "string") {
      return sectionData[key] as string;
    }
    // Fallback to Uzbek
    const fallback = translations.uz[section] as
      | Record<string, unknown>
      | undefined;
    if (fallback && typeof fallback[key] === "string") {
      return fallback[key] as string;
    }
    return key;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
