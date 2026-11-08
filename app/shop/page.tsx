"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { StoreShell } from "@/components/shop/StoreShell";
import { pickCopy } from "@/lib/copy";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

export default function ShopPage() {
  const { lang } = useUi();
  const { products, categories, ready } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const categorySlug = params.get("category") || "all";
  const sort = params.get("sort") || "featured";
  const sorts = [
    { id: "featured", ar: "مميز", en: "Featured" },
    { id: "new", ar: "الأحدث", en: "Newest" },
    { id: "price-asc", ar: "الأرخص", en: "Lowest" },
    { id: "price-desc", ar: "الأغلى", en: "Highest" },
  ];

  function applySort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    const queryString = next.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop", {
      scroll: false,
    });
  }
  const [query, setQuery] = useState("");

  const category =
    categorySlug === "all"
      ? null
      : categories.find((c) => c.slug === categorySlug || c.id === categorySlug);

  const filtered = useMemo(() => {
    let rows = [...products];
    if (category) {
      rows = rows.filter((p) => p.categoryIds.includes(category.id));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((p) => {
        const name = `${p.name.ar} ${p.name.en} ${p.description.ar} ${p.description.en}`.toLowerCase();
        return name.includes(q) || p.slug.toLowerCase().includes(q);
      });
    }
    if (sort === "price-asc") rows.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") rows.sort((a, b) => b.price - a.price);
    else if (sort === "new") rows.sort((a, b) => b.createdAt - a.createdAt);
    else rows.sort((a, b) => Number(b.featured) - Number(a.featured));
    return rows;
  }, [products, category, sort, query]);

  if (!ready) {
    return (
      <StoreShell>
        <ShopSkeleton />
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-6">
        <p className="text-sm font-semibold text-primary">
          {lang === "ar" ? "المتجر" : "Shop"}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
          {category
            ? pickCopy(category.name, lang)
            : lang === "ar"
              ? "كل المنتجات"
              : "All products"}
        </h1>
        <p className="mt-3 text-muted">
          {filtered.length}{" "}
          {lang === "ar" ? "قطعة" : filtered.length === 1 ? "piece" : "pieces"}
        </p>

        <div className="mt-6">
          <label className="block">
            <span className="sr-only">
              {lang === "ar" ? "بحث" : "Search"}
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === "ar" ? "دوري على منتج..." : "Search products..."
              }
              className="min-h-12 w-full rounded-2xl border border-input-border bg-input-background px-4 text-base outline-none focus:border-primary sm:max-w-md"
            />
          </label>
        </div>

        <div className="mt-6 space-y-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <FilterChip
              href={sort !== "featured" ? `/shop?sort=${sort}` : "/shop"}
              active={categorySlug === "all"}
              label={lang === "ar" ? "الكل" : "All"}
            />
            {categories
              .filter((c) => c.visible)
              .map((c) => (
                <FilterChip
                  key={c.id}
                  href={`/shop?category=${c.slug}${sort !== "featured" ? `&sort=${sort}` : ""}`}
                  active={category?.id === c.id}
                  label={pickCopy(c.name, lang)}
                />
              ))}
          </div>
          <div
            role="group"
            aria-label={lang === "ar" ? "ترتيب" : "Sort"}
            className="flex w-full flex-wrap items-center gap-1.5 rounded-3xl border border-line bg-card p-1.5 ps-4 sm:w-fit sm:rounded-full"
          >
            <span className="shrink-0 text-xs font-bold text-muted">
              {lang === "ar" ? "ترتيب" : "Sort"}
            </span>
            <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />
            {sorts.map((item) => {
              const active = sort === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applySort(item.id)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-chip"
                  }`}
                >
                  {lang === "ar" ? item.ar : item.en}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted">
              {query.trim()
                ? lang === "ar"
                  ? "مفيش نتائج للبحث ده."
                  : "No results for that search."
                : lang === "ar"
                  ? "لا توجد منتجات في هذه المجموعة."
                  : "No products in this collection."}
            </p>
            {query.trim() ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 min-h-11 text-sm font-bold text-primary"
              >
                {lang === "ar" ? "مسح البحث" : "Clear search"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </StoreShell>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-primary text-white"
          : "border border-line bg-card hover:border-primary"
      }`}
    >
      {label}
    </a>
  );
}
