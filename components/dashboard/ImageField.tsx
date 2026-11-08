"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { uploadImageToFirebaseStorage } from "@/lib/media-upload";

const FALLBACK_IMAGES = [
  { src: "/assets/logo.jpeg", name: "شعار ونس" },
];

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";
const DEFAULT_HINT = "JPG, PNG, WEBP";

function fileMatchesAccept(file: File, accept: string) {
  const tokens = accept.split(",").map((item) => item.trim().toLowerCase());
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token === "image/svg+xml") return type === token || name.endsWith(".svg");
    if (token === "image/gif") return type === token || name.endsWith(".gif");
    if (token === "image/png") return type === token || name.endsWith(".png");
    if (token === "image/jpeg" || token === "image/jpg") {
      return type === "image/jpeg" || type === "image/jpg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
    }
    if (token === "image/webp") return type === token || name.endsWith(".webp");
    return type === token;
  });
}

export function ImageField({
  label,
  value,
  onChange,
  library = true,
  contain = false,
  accept = DEFAULT_ACCEPT,
  formatsHint = DEFAULT_HINT,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  library?: boolean;
  contain?: boolean;
  accept?: string;
  formatsHint?: string;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFromFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken(true);
      if (!token) throw new Error("سجل الدخول أولاً");

      const cloudinaryConfigured = Boolean(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim(),
      );

      // Skip Cloudinary round-trip when public cloud name is unset.
      if (!cloudinaryConfigured) {
        const url = await uploadImageToFirebaseStorage(file);
        onChange(url);
        return;
      }

      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const raw = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as { url?: string; error?: string }) : {};
      } catch {
        data = {};
      }

      if (res.ok && data.url) {
        onChange(data.url);
        return;
      }

      const cloudinaryMissing =
        res.status >= 500 ||
        /cloudinary|غير مضبوط|مفاتيح/i.test(data.error || raw || "");

      if (cloudinaryMissing || res.status === 500) {
        const url = await uploadImageToFirebaseStorage(file);
        onChange(url);
        return;
      }

      throw new Error(
        data.error ||
          (res.status === 401
            ? "غير مصرح. سجّل الدخول مرة أخرى"
            : "فشل الرفع"),
      );
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "فشل الرفع";
      void fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          source: "client",
          path: "/api/media/upload",
          status: 500,
        }),
      }).catch(() => undefined);
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  function takeFile(file: File | undefined) {
    if (!file) return;
    if (!fileMatchesAccept(file, accept)) {
      setError(`الصيغة المسموحة: ${formatsHint}`);
      return;
    }
    void uploadFromFile(file);
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {value ? (
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <EyeIcon />
            عرض الصورة
          </button>
        ) : null}
        <label
          className={`inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover ${
            uploading ? "pointer-events-none opacity-60" : "cursor-pointer"
          }`}
        >
          {uploading ? "جاري الرفع..." : "رفع صورة"}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              takeFile(file);
            }}
          />
        </label>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          takeFile(event.dataTransfer.files[0]);
        }}
        className={`rounded-xl border border-dashed px-4 py-6 text-center text-xs text-muted ${
          dragOver ? "border-primary bg-primary/10 text-primary" : "border-line"
        }`}
      >
        اسحب الصورة هنا أو اضغط رفع صورة ({formatsHint}) · Cloudinary / wanas
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {value ? (
        <div className="overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={`h-32 w-full ${contain ? "object-contain bg-chip" : "object-cover"}`} />
        </div>
      ) : null}
      {library ? (
      <>
      <p className="text-xs text-muted">أو اختار من الصور الافتراضية</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FALLBACK_IMAGES.map((image) => {
          const selected = value === image.src;
          return (
            <button
              key={image.src}
              type="button"
              onClick={() => onChange(image.src)}
              className={`relative overflow-hidden rounded-xl border text-start transition ${
                selected
                  ? "border-primary ring-2 ring-primary"
                  : "border-line hover:border-primary"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.name}
                className="h-24 w-full object-cover"
              />
              {selected ? <span className="absolute inset-0 bg-primary/25" /> : null}
              <span className="flex items-center justify-between gap-1 px-2 py-1.5 text-xs">
                <span className="truncate">{image.name}</span>
                {selected ? (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 font-bold text-white">
                    مختارة
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      </>
      ) : null}
      {preview && value ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4"
          onClick={() => setPreview(false)}
        >
          <button
            type="button"
            className="absolute end-4 top-4 rounded-full bg-white/15 px-3 py-1 text-sm text-white"
            onClick={() => setPreview(false)}
          >
            إغلاق
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
