"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LazyImage } from "@/components/shop/LazyImage";
import { formatEgp, productImage, type Product } from "@/lib/commerce";
import { pickCopy } from "@/lib/copy";
import { useCart } from "@/lib/cart";
import { useUi } from "@/lib/ui";

export function ProductCard({ product }: { product: Product }) {
  const { lang } = useUi();
  const { lines, add, setQty } = useCart();
  const image = productImage(product);
  const qty = lines.find((line) => line.productId === product.id)?.qty || 0;
  const inCart = qty > 0;
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (!bump) return;
    const t = window.setTimeout(() => setBump(0), 380);
    return () => window.clearTimeout(t);
  }, [bump]);

  function onAdd() {
    if (product.stock < 1) return;
    add(product.id, 1);
    setBump((n) => n + 1);
  }

  function onMinus() {
    setQty(product.id, qty - 1);
    setBump((n) => n + 1);
  }

  function onPlus() {
    if (qty >= product.stock) return;
    setQty(product.id, qty + 1);
    setBump((n) => n + 1);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-background-secondary"
      >
        <LazyImage
          src={image}
          alt={pickCopy(product.name, lang)}
          sizes="(max-width: 768px) 50vw, 25vw"
          zoomOnHover
        />
        {product.compareAtPrice && product.compareAtPrice > product.price ? (
          <span className="absolute start-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
            {lang === "ar" ? "عرض" : "Sale"}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-bold leading-snug sm:text-lg">
            {pickCopy(product.name, lang)}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-base font-extrabold text-primary">
            {formatEgp(product.price, lang)}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <p className="text-sm text-muted line-through">
              {formatEgp(product.compareAtPrice, lang)}
            </p>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          {product.stock < 1 ? (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white opacity-50"
            >
              {lang === "ar" ? "غير متوفر" : "Out of stock"}
            </button>
          ) : (
            <div
              className={`cart-action ${bump ? "cart-action-bump" : ""} ${
                inCart ? "is-counter" : "is-add"
              }`}
            >
              {!inCart ? (
                <button
                  type="button"
                  onClick={onAdd}
                  className="cart-action-add inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover"
                >
                  {lang === "ar" ? "أضيفي للسلة" : "Add to cart"}
                </button>
              ) : (
                <div
                  key={`counter-${product.id}`}
                  className="cart-action-counter flex min-h-11 w-full items-center justify-between gap-1 rounded-full bg-primary px-1.5 text-white sm:px-2"
                >
                  <button
                    type="button"
                    onClick={onMinus}
                    aria-label={lang === "ar" ? "تقليل" : "Decrease"}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-bold transition hover:bg-white/15 active:scale-90"
                  >
                    −
                  </button>
                  <span
                    key={qty}
                    className="cart-qty-tick min-w-8 text-center text-sm font-extrabold tabular-nums"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={onPlus}
                    disabled={qty >= product.stock}
                    aria-label={lang === "ar" ? "زيادة" : "Increase"}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-bold transition hover:bg-white/15 active:scale-90 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
