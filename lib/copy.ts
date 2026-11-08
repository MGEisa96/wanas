export type Copy = { ar: string; en: string };

export function pickCopy(value: Copy, lang: "ar" | "en") {
  return value[lang] || value.ar || value.en || "";
}

export function emptyCopy(): Copy {
  return { ar: "", en: "" };
}
