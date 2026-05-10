export const THEME_EVENT = "kings-theme-change";
export const THEME_STORAGE_KEY = "theme";
export const LAST_DARK_THEME_STORAGE_KEY = "kings_last_dark_theme";

export const THEME_PREFERENCES = [
  "light",
  "dark",
  "midnight",
  "system",
] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedThemeMode = "light" | "dark" | "midnight";

function isBrowser() {
  return typeof window !== "undefined";
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

export function getStoredThemePreference(): ThemePreference {
  if (!isBrowser()) {
    return "system";
  }

  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(value) ? value : "system";
}

export function getLastDarkThemePreference(): Exclude<
  ThemePreference,
  "light" | "system"
> {
  if (!isBrowser()) {
    return "dark";
  }

  const value = window.localStorage.getItem(LAST_DARK_THEME_STORAGE_KEY);
  return value === "midnight" ? "midnight" : "dark";
}

export function resolveThemePreference(
  theme: ThemePreference
): ResolvedThemeMode {
  if (theme === "midnight") {
    return "midnight";
  }

  if (theme === "dark") {
    return "dark";
  }

  if (theme === "light") {
    return "light";
  }

  if (
    isBrowser() &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function applyThemePreference(theme: ThemePreference) {
  if (!isBrowser()) {
    return;
  }

  const root = document.documentElement;
  const resolved = resolveThemePreference(theme);

  root.classList.toggle("dark", resolved !== "light");
  root.dataset.theme = resolved;

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (theme === "dark" || theme === "midnight") {
    window.localStorage.setItem(LAST_DARK_THEME_STORAGE_KEY, theme);
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

export function toggleThemePreference() {
  const currentTheme = getStoredThemePreference();
  const resolved = resolveThemePreference(currentTheme);

  if (resolved === "light") {
    applyThemePreference(getLastDarkThemePreference());
    return;
  }

  applyThemePreference("light");
}
