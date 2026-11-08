"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  themeFromPreference,
  type Theme,
  type ThemePreference,
} from "./theme";

export type Lang = "ar" | "en";
export type { Theme, ThemePreference };

type UiContextValue = {
  lang: Lang;
  theme: Theme;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  toggleTheme: (options?: { persist?: boolean }) => void;
  applySiteThemePreference: (preference: ThemePreference) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [theme, setTheme] = useState<Theme>("light");
  const [sitePref, setSitePref] = useState<ThemePreference>("light");
  const overrideRef = useRef(false);

  useLayoutEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      overrideRef.current = true;
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (overrideRef.current) return;
    setTheme(themeFromPreference(sitePref));
  }, [sitePref]);

  useEffect(() => {
    if (overrideRef.current || sitePref !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [sitePref]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [lang, theme]);

  const value = useMemo<UiContextValue>(
    () => ({
      lang,
      theme,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      toggleLang: () => setLang((current) => (current === "ar" ? "en" : "ar")),
      toggleTheme: (options) => {
        const persist = options?.persist !== false;
        if (persist) overrideRef.current = true;
        setTheme((current) => {
          const next = current === "dark" ? "light" : "dark";
          if (persist) localStorage.setItem(THEME_STORAGE_KEY, next);
          return next;
        });
      },
      applySiteThemePreference: setSitePref,
    }),
    [lang, theme],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}

export function pick<T extends { ar: string; en: string }>(
  item: T,
  lang: Lang,
) {
  return item[lang];
}
