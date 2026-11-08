export const THEME_STORAGE_KEY = "wanas-theme";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

export type Theme = "light" | "dark";
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const THEME_PREFERENCE_LABELS: Record<ThemePreference, string> = {
  light: "فاتح",
  dark: "داكن",
  system: "حسب النظام",
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return (THEME_PREFERENCES as readonly string[]).includes(value as string);
}

export function themeFromPreference(preference: ThemePreference): Theme {
  if (preference === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")return;var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.classList.toggle("light",t==="light");}catch(e){}})();`;
