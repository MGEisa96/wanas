"use client";

import { useState } from "react";
import { ImageField } from "./ImageField";

export function MultiImageField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const images = values.filter(Boolean);

  function addUrl() {
    const next = urlDraft.trim();
    if (!next) return;
    if (!/^https?:\/\//i.test(next) && !next.startsWith("/")) {
      return;
    }
    if (images.includes(next)) {
      setUrlDraft("");
      return;
    }
    onChange([...images, next]);
    setUrlDraft("");
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    onChange(copy);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted">{images.length} صورة</span>
      </div>

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="overflow-hidden rounded-2xl border border-line bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-28 w-full object-cover" />
              <div className="flex flex-wrap items-center gap-1 p-2">
                {index === 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                    رئيسية
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => move(index, -index)}
                    className="rounded-full border border-line px-2 py-0.5 text-[10px] font-bold"
                  >
                    اجعلها رئيسية
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-full border border-line px-2 py-0.5 text-[10px] font-bold disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded-full border border-line px-2 py-0.5 text-[10px] font-bold disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(images.filter((_, i) => i !== index))
                  }
                  className="ms-auto rounded-full px-2 py-0.5 text-[10px] font-bold text-error"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          لا توجد صور بعد — ارفعي صورة أو الصقي رابط.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="https://... أو /assets/..."
          dir="ltr"
          className="min-h-11 w-full rounded-2xl border border-input-border bg-input-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={addUrl}
          className="min-h-11 rounded-2xl bg-foreground px-4 text-sm font-bold text-background"
        >
          إضافة رابط
        </button>
      </div>

      <ImageField
        label="رفع صورة جديدة (Cloudinary أو Firebase Storage)"
        value=""
        library={false}
        onChange={(url) => {
          if (!url || images.includes(url)) return;
          onChange([...images, url]);
        }}
      />
    </div>
  );
}
