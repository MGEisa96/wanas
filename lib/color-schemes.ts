export const SCHEME_IDS = [
  "navy",
  "gold",
  "emerald",
  "ruby",
  "sand",
  "custom",
] as const;

export type SchemeId = (typeof SCHEME_IDS)[number];

export type ColorTokens = {
  primary: string;
  "primary-hover": string;
  "primary-light": string;
  background: string;
  "background-secondary": string;
  "background-tertiary": string;
  surface: string;
  "surface-hover": string;
  foreground: string;
  "foreground-secondary": string;
  "foreground-muted": string;
  border: string;
  "border-hover": string;
  "input-background": string;
  "input-border": string;
  overlay: string;
};

export type SchemeMode = {
  light: ColorTokens;
  dark: ColorTokens;
};

export const TOKEN_FIELDS: Array<{ key: keyof ColorTokens; ar: string }> = [
  { key: "primary", ar: "اللون الأساسي" },
  { key: "primary-hover", ar: "أساسي عند المرور" },
  { key: "primary-light", ar: "أساسي فاتح" },
  { key: "background", ar: "خلفية الصفحة" },
  { key: "background-secondary", ar: "خلفية ثانوية" },
  { key: "background-tertiary", ar: "خلفية ثالثة" },
  { key: "surface", ar: "سطح البطاقات" },
  { key: "surface-hover", ar: "سطح عند المرور" },
  { key: "foreground", ar: "لون النص" },
  { key: "foreground-secondary", ar: "نص ثانوي" },
  { key: "foreground-muted", ar: "نص خافت" },
  { key: "border", ar: "الحدود" },
  { key: "border-hover", ar: "حدود عند المرور" },
  { key: "input-background", ar: "خلفية الحقول" },
  { key: "input-border", ar: "حدود الحقول" },
  { key: "overlay", ar: "الطبقة الشفافة" },
];

const NAVY: SchemeMode = {
  light: {
    primary: "#2563eb",
    "primary-hover": "#1d4ed8",
    "primary-light": "#60a5fa",
    background: "#f8fafc",
    "background-secondary": "#f1f5f9",
    "background-tertiary": "#e8eef5",
    surface: "#ffffff",
    "surface-hover": "#f8fafc",
    foreground: "#0f172a",
    "foreground-secondary": "#475569",
    "foreground-muted": "#94a3b8",
    border: "#e2e8f0",
    "border-hover": "#cbd5e1",
    "input-background": "#ffffff",
    "input-border": "#cbd5e1",
    overlay: "rgba(15, 23, 42, 0.55)",
  },
  dark: {
    primary: "#4f8cff",
    "primary-hover": "#6ba0ff",
    "primary-light": "#9bbeff",
    background: "#07111f",
    "background-secondary": "#0b1728",
    "background-tertiary": "#112238",
    surface: "#0e1b2d",
    "surface-hover": "#14263d",
    foreground: "#f5f7fa",
    "foreground-secondary": "#b8c4d4",
    "foreground-muted": "#718096",
    border: "#1e3047",
    "border-hover": "#2b4564",
    "input-background": "#0d1a2b",
    "input-border": "#263b55",
    overlay: "rgba(3, 10, 20, 0.72)",
  },
};

const GOLD: SchemeMode = {
  light: {
    primary: "#b45309",
    "primary-hover": "#92400e",
    "primary-light": "#d97706",
    background: "#faf7f2",
    "background-secondary": "#f3ece1",
    "background-tertiary": "#e8dcc8",
    surface: "#fffdf9",
    "surface-hover": "#f7f0e6",
    foreground: "#1c1410",
    "foreground-secondary": "#5c4a3a",
    "foreground-muted": "#a38b72",
    border: "#e8d9c4",
    "border-hover": "#d4be9e",
    "input-background": "#fffdf9",
    "input-border": "#d4be9e",
    overlay: "rgba(28, 20, 16, 0.5)",
  },
  dark: {
    primary: "#e8b86d",
    "primary-hover": "#f3cc8a",
    "primary-light": "#f6d9a8",
    background: "#140f0a",
    "background-secondary": "#1c1610",
    "background-tertiary": "#261e16",
    surface: "#1c1610",
    "surface-hover": "#2a2118",
    foreground: "#f8f1e7",
    "foreground-secondary": "#d4c0a4",
    "foreground-muted": "#8a7358",
    border: "#3a2e22",
    "border-hover": "#534433",
    "input-background": "#1a140f",
    "input-border": "#3f3226",
    overlay: "rgba(10, 7, 4, 0.72)",
  },
};

const EMERALD: SchemeMode = {
  light: {
    primary: "#047857",
    "primary-hover": "#065f46",
    "primary-light": "#10b981",
    background: "#f3faf7",
    "background-secondary": "#e6f4ee",
    "background-tertiary": "#d5ebe3",
    surface: "#ffffff",
    "surface-hover": "#eef8f3",
    foreground: "#0f1f19",
    "foreground-secondary": "#3d5c50",
    "foreground-muted": "#7a9a8c",
    border: "#cfe5db",
    "border-hover": "#a9cfc0",
    "input-background": "#ffffff",
    "input-border": "#a9cfc0",
    overlay: "rgba(15, 31, 25, 0.5)",
  },
  dark: {
    primary: "#34d399",
    "primary-hover": "#6ee7b7",
    "primary-light": "#a7f3d0",
    background: "#071410",
    "background-secondary": "#0c1f18",
    "background-tertiary": "#123028",
    surface: "#0c1f18",
    "surface-hover": "#15352b",
    foreground: "#e8faf3",
    "foreground-secondary": "#b5d4c6",
    "foreground-muted": "#6b9082",
    border: "#1c3d32",
    "border-hover": "#2a5748",
    "input-background": "#0a1a14",
    "input-border": "#24493c",
    overlay: "rgba(3, 12, 9, 0.72)",
  },
};

const RUBY: SchemeMode = {
  light: {
    primary: "#be123c",
    "primary-hover": "#9f1239",
    "primary-light": "#e11d48",
    background: "#fdf6f7",
    "background-secondary": "#f8e9ec",
    "background-tertiary": "#f0d5db",
    surface: "#ffffff",
    "surface-hover": "#fbeff1",
    foreground: "#1c1014",
    "foreground-secondary": "#6b3a46",
    "foreground-muted": "#b07a86",
    border: "#f0d0d6",
    "border-hover": "#e0aeb7",
    "input-background": "#ffffff",
    "input-border": "#e0aeb7",
    overlay: "rgba(28, 16, 20, 0.5)",
  },
  dark: {
    primary: "#fb7185",
    "primary-hover": "#fda4af",
    "primary-light": "#fecdd3",
    background: "#14080c",
    "background-secondary": "#1c0e14",
    "background-tertiary": "#2a141c",
    surface: "#1c0e14",
    "surface-hover": "#2b1520",
    foreground: "#fdecef",
    "foreground-secondary": "#e7b8c0",
    "foreground-muted": "#9a6b74",
    border: "#3d1c26",
    "border-hover": "#5a2a38",
    "input-background": "#180a10",
    "input-border": "#4a2230",
    overlay: "rgba(12, 4, 8, 0.72)",
  },
};

const SAND: SchemeMode = {
  light: {
    primary: "#b87d6b",
    "primary-hover": "#9f6757",
    "primary-light": "#d4a698",
    background: "#f7f4ef",
    "background-secondary": "#efe8df",
    "background-tertiary": "#e4d9cd",
    surface: "#fffdfb",
    "surface-hover": "#f3ece4",
    foreground: "#2a211c",
    "foreground-secondary": "#5f524a",
    "foreground-muted": "#9a8b81",
    border: "#e4d8ce",
    "border-hover": "#d0bfb2",
    "input-background": "#fffdfb",
    "input-border": "#d0bfb2",
    overlay: "rgba(42, 33, 28, 0.5)",
  },
  dark: {
    primary: "#d4a698",
    "primary-hover": "#e0b9ad",
    "primary-light": "#edd0c7",
    background: "#171311",
    "background-secondary": "#201a17",
    "background-tertiary": "#2c231f",
    surface: "#201a17",
    "surface-hover": "#322824",
    foreground: "#f6eee9",
    "foreground-secondary": "#d4c4bb",
    "foreground-muted": "#9a8b81",
    border: "#3a302b",
    "border-hover": "#534640",
    "input-background": "#1a1513",
    "input-border": "#433833",
    overlay: "rgba(10, 8, 7, 0.72)",
  },
};

export const PRESET_SCHEMES: Record<
  Exclude<SchemeId, "custom">,
  {
    ar: string;
    en: string;
    tokens: SchemeMode;
  }
> = {
  navy: { ar: "أزرق ملكي", en: "Navy", tokens: NAVY },
  gold: { ar: "ذهبي فاخر", en: "Gold", tokens: GOLD },
  emerald: { ar: "زمردي", en: "Emerald", tokens: EMERALD },
  ruby: { ar: "ياقوتي", en: "Ruby", tokens: RUBY },
  sand: { ar: "رملي", en: "Sand", tokens: SAND },
};

export function isSchemeId(value: unknown): value is SchemeId {
  return SCHEME_IDS.includes(value as SchemeId);
}

export function cloneTokens(tokens: ColorTokens): ColorTokens {
  return { ...tokens };
}

export function defaultCustomTokens(): SchemeMode {
  return {
    light: cloneTokens(NAVY.light),
    dark: cloneTokens(NAVY.dark),
  };
}

export function tokensFor(
  scheme: SchemeId,
  mode: "light" | "dark",
  custom: SchemeMode,
): ColorTokens {
  if (scheme === "custom") return cloneTokens(custom[mode]);
  return cloneTokens(PRESET_SCHEMES[scheme].tokens[mode]);
}

const CSS_KEYS = TOKEN_FIELDS.map((item) => item.key);

export function applyColorTokens(tokens: ColorTokens) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const key of CSS_KEYS) {
    root.style.setProperty(`--${key}`, tokens[key]);
  }
}
