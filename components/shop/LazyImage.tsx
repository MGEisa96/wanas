"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK = "/assets/logo.jpeg";

const ALLOWED_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "firebasestorage.googleapis.com",
  "wanas-47c35.firebasestorage.app",
]);

function resolveSrc(src: string | undefined | null) {
  if (!src || typeof src !== "string") return FALLBACK;
  const trimmed = src.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return FALLBACK;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("data:")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return FALLBACK;
    if (!ALLOWED_HOSTS.has(url.hostname)) return FALLBACK;
    return trimmed;
  } catch {
    return FALLBACK;
  }
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Soft zoom on parent hover (product cards). */
  zoomOnHover?: boolean;
};

/**
 * Lazy product image with skeleton + broken-image fallback.
 * Never shows the browser “corrupt” icon/alt spill.
 */
export function LazyImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  zoomOnHover = false,
}: Props) {
  const [current, setCurrent] = useState(() => resolveSrc(src));
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setCurrent(resolveSrc(src));
    setLoaded(false);
    setBroken(false);
  }, [src]);

  return (
    <>
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-chip via-background-secondary to-chip"
          aria-hidden
        />
      ) : null}

      {!broken ? (
        <Image
          src={current}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (current !== FALLBACK) {
              setCurrent(FALLBACK);
              setLoaded(false);
              return;
            }
            setBroken(true);
            setLoaded(true);
          }}
          className={`object-cover transition duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${zoomOnHover ? "group-hover:scale-105" : ""} ${className}`}
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center bg-chip"
          role="img"
          aria-label={alt || "Wanas"}
        >
          <span className="rounded-full border border-line bg-card px-3 py-1.5 text-[11px] font-bold text-muted">
            {(alt || "ونس").slice(0, 18)}
          </span>
        </span>
      )}
    </>
  );
}
