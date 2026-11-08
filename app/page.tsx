"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { StoreShell } from "@/components/shop/StoreShell";
import { pickCopy } from "@/lib/copy";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

export default function HomePage() {
  const { lang } = useUi();
  const { settings, products, categories } = useStore();
  const featuredIds = new Set(settings.featuredProductIds);
  const featured = products.filter(
    (p) => featuredIds.has(p.id) || p.featured,
  ).slice(0, 4);
  const visibleCategories = categories.filter((c) => c.visible);

  return (
    <StoreShell>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <Image
            src={settings.hero.image || settings.brand.logo}
            alt=""
            fill
            priority
            loading="eager"
            fetchPriority="high"
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
        </div>
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-20 sm:min-h-[78vh] sm:pb-16 sm:pt-24 lg:px-6">
          <p className="text-sm font-semibold tracking-wide text-primary">
            {pickCopy(settings.hero.eyebrow, lang)}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.08] sm:text-6xl md:text-7xl">
            {pickCopy(settings.hero.title, lang)}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:mt-5 sm:text-lg sm:leading-8">
            {pickCopy(settings.hero.subtitle, lang)}
          </p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {pickCopy(settings.hero.cta, lang)}
            </Link>
            <Link
              href="/shop?category=gifts"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-card/80 px-6 py-3 text-sm font-bold"
            >
              {lang === "ar" ? "بوكسات الهدايا" : "Gift boxes"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              {lang === "ar" ? "المجموعات" : "Collections"}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {lang === "ar" ? "تسوّقي حسب المزاج" : "Shop by mood"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 text-sm font-bold text-primary"
          >
            {lang === "ar" ? "كل المنتجات" : "All products"}
          </Link>
        </div>
        <div className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:flex lg:flex-wrap">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary sm:w-full lg:w-auto"
            >
              {pickCopy(category.name, lang)}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">
                {lang === "ar" ? "مختارات ونس" : "Wanas picks"}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                {lang === "ar" ? "قطع مميزة" : "Featured pieces"}
              </h2>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {(featured.length ? featured : products.slice(0, 4)).map(
              (product) => (
                <ProductCard key={product.id} product={product} />
              ),
            )}
          </div>
          {!featured.length && !products.length ? (
            <p className="mt-10 text-center text-sm text-muted">
              {lang === "ar"
                ? "هنضيف المنتجات قريبًا."
                : "Products coming soon."}
            </p>
          ) : null}
          <div className="mt-8 flex justify-center sm:mt-10">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center rounded-full border border-line bg-card px-6 py-3 text-sm font-bold"
            >
              {lang === "ar" ? "شوفي كل المنتجات" : "Browse all products"}
            </Link>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
