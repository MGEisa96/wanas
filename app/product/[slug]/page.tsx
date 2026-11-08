"use client";

import Link from "next/link";
import { use, useMemo, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/Icons";
import { LazyImage } from "@/components/shop/LazyImage";
import { StoreShell } from "@/components/shop/StoreShell";
import { formatEgp, productImage, waLink } from "@/lib/commerce";
import { pickCopy } from "@/lib/copy";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { lang } = useUi();
  const { products, settings } = useStore();
  const { add } = useCart();
  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug) || null,
    [products, slug],
  );
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const touchX = useRef<number | null>(null);

  if (!product) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl font-extrabold">
            {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
          </h1>
          <Link href="/shop" className="mt-6 inline-block text-primary font-bold">
            {lang === "ar" ? "العودة للمتجر" : "Back to shop"}
          </Link>
        </div>
      </StoreShell>
    );
  }

  const images = product.images.length ? product.images : [productImage(product)];
  const image = images[Math.min(activeImage, images.length - 1)];

  function stepImage(delta: number) {
    setActiveImage((current) => {
      const next = (current + delta + images.length) % images.length;
      return next;
    });
  }

  return (
    <StoreShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:py-10 lg:grid-cols-2 lg:px-6">
        <div>
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-card sm:aspect-[5/6] lg:aspect-[4/5]"
            onTouchStart={(e) => {
              touchX.current = e.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchX.current == null || images.length < 2) return;
              const endX = e.changedTouches[0]?.clientX ?? touchX.current;
              const delta = endX - touchX.current;
              touchX.current = null;
              if (Math.abs(delta) < 40) return;
              // RTL: swipe left (negative) advances; LTR opposite feel still OK
              stepImage(delta < 0 ? 1 : -1);
            }}
          >
            <LazyImage
              src={image}
              alt={pickCopy(product.name, lang)}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {images.length > 1 ? (
              <>
                <div className="absolute inset-x-0 top-3 flex justify-center">
                  <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white">
                    {activeImage + 1}/{images.length}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={lang === "ar" ? "الصورة السابقة" : "Previous image"}
                  onClick={() => stepImage(-1)}
                  className="absolute start-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-lg font-bold text-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label={lang === "ar" ? "الصورة التالية" : "Next image"}
                  onClick={() => stepImage(1)}
                  className="absolute end-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-lg font-bold text-white"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border sm:h-20 sm:w-20 ${
                    index === activeImage ? "border-primary ring-2 ring-primary/30" : "border-line"
                  }`}
                >
                  <LazyImage src={src} alt="" sizes="80px" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col pb-28 lg:pb-0">
          <p className="text-sm font-semibold text-primary">
            {lang === "ar" ? "تفاصيل القطعة" : "Piece details"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            {pickCopy(product.name, lang)}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-extrabold text-primary sm:text-3xl">
              {formatEgp(product.price, lang)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-base text-muted line-through sm:text-lg">
                {formatEgp(product.compareAtPrice, lang)}
              </p>
            ) : null}
          </div>
          <p className="mt-6 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {pickCopy(product.description, lang)}
          </p>
          <p className="mt-4 text-sm text-muted">
            {product.stock > 0
              ? lang === "ar"
                ? `المتوفر: ${product.stock}`
                : `In stock: ${product.stock}`
              : lang === "ar"
                ? "غير متوفر حالياً"
                : "Currently unavailable"}
          </p>

          <div className="mt-8 hidden flex-wrap items-center gap-3 lg:flex">
            <label className="flex min-h-12 items-center gap-2 rounded-full border border-line bg-card px-4 py-2">
              <span className="text-sm text-muted">
                {lang === "ar" ? "الكمية" : "Qty"}
              </span>
              <input
                type="number"
                min={1}
                max={Math.max(1, product.stock)}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 1)}
                className="w-16 bg-transparent text-center outline-none"
              />
            </label>
            <button
              type="button"
              disabled={product.stock < 1}
              onClick={() => add(product.id, qty)}
              className="min-h-12 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {lang === "ar" ? "أضيفي للسلة" : "Add to cart"}
            </button>
            <a
              href={waLink(
                lang === "ar"
                  ? `سؤال عن منتج: ${product.name.ar}`
                  : `Question about: ${product.name.en}`,
                settings.phones.whatsapp,
              )}
              target="_blank"
              rel="noreferrer"
              className="min-h-12 rounded-full border border-line px-6 py-3 text-sm font-bold"
            >
              WhatsApp
            </a>
          </div>

          <Link
            href="/cart"
            className="mt-6 hidden text-sm font-bold text-primary lg:inline"
          >
            {lang === "ar" ? "عرض السلة ←" : "View cart →"}
          </Link>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[4.25rem] z-40 border-t border-line bg-background/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <label className="flex min-h-12 items-center gap-2 rounded-full border border-line bg-card px-3">
            <input
              type="number"
              min={1}
              max={Math.max(1, product.stock)}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="w-12 bg-transparent text-center text-sm outline-none"
              aria-label={lang === "ar" ? "الكمية" : "Qty"}
            />
          </label>
          <button
            type="button"
            disabled={product.stock < 1}
            onClick={() => add(product.id, qty)}
            className="min-h-12 flex-1 rounded-full bg-primary px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {lang === "ar" ? "أضيفي للسلة" : "Add to cart"}
          </button>
          <a
            href={waLink(
              lang === "ar"
                ? `سؤال عن منتج: ${product.name.ar}`
                : `Question about: ${product.name.en}`,
              settings.phones.whatsapp,
            )}
            target="_blank"
            rel="noreferrer"
            className="grid min-h-12 min-w-12 place-items-center rounded-full bg-[#25D366] text-white"
            aria-label={lang === "ar" ? "واتساب" : "WhatsApp"}
            title={lang === "ar" ? "واتساب" : "WhatsApp"}
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </StoreShell>
  );
}
