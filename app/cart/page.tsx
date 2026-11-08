"use client";

import Link from "next/link";
import { LazyImage } from "@/components/shop/LazyImage";
import { StoreShell } from "@/components/shop/StoreShell";
import { formatEgp, productImage } from "@/lib/commerce";
import { pickCopy } from "@/lib/copy";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

export default function CartPage() {
  const { lang } = useUi();
  const { lines, setQty, remove, clear } = useCart();
  const { products } = useStore();

  const rows = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      return { line, product };
    })
    .filter(Boolean) as Array<{
    line: { productId: string; qty: number };
    product: (typeof products)[number];
  }>;

  const subtotal = rows.reduce(
    (sum, row) => sum + row.product.price * row.line.qty,
    0,
  );
  const itemCount = rows.reduce((sum, row) => sum + row.line.qty, 0);

  return (
    <StoreShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {lang === "ar" ? "سلة التسوق" : "Your cart"}
            </h1>
            {rows.length > 0 ? (
              <p className="mt-2 text-sm text-muted">
                {itemCount}{" "}
                {lang === "ar" ? "قطعة" : itemCount === 1 ? "item" : "items"}
              </p>
            ) : null}
          </div>
          {rows.length > 0 ? (
            <button
              type="button"
              onClick={() => clear()}
              className="min-h-11 text-sm font-semibold text-error"
            >
              {lang === "ar" ? "إفراغ السلة" : "Clear cart"}
            </button>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-dashed border-line bg-card/50 px-6 py-16 text-center">
            <p className="text-lg font-bold">
              {lang === "ar" ? "السلة فاضية" : "Your cart is empty"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {lang === "ar"
                ? "اختاري قطع من المتجر وارجعي هنا لإتمام الطلب."
                : "Pick pieces from the shop, then come back to checkout."}
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              {lang === "ar" ? "تسوقي الآن" : "Shop now"}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4 pb-28 lg:pb-0">
            {rows.map(({ line, product }) => (
              <article
                key={product.id}
                className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-4 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="relative h-36 w-full overflow-hidden rounded-2xl sm:h-24 sm:w-24 sm:shrink-0"
                >
                  <LazyImage
                    src={productImage(product)}
                    alt={pickCopy(product.name, lang)}
                    sizes="(max-width: 640px) 100vw, 96px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${product.slug}`} className="font-bold">
                    {pickCopy(product.name, lang)}
                  </Link>
                  <p className="mt-1 text-sm text-primary">
                    {formatEgp(product.price, lang)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-1 rounded-full border border-line bg-background p-1">
                    <button
                      type="button"
                      aria-label={lang === "ar" ? "تقليل" : "Decrease"}
                      onClick={() =>
                        setQty(product.id, Math.max(1, line.qty - 1))
                      }
                      className="grid h-10 w-10 place-items-center rounded-full text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={lang === "ar" ? "زيادة" : "Increase"}
                      disabled={line.qty >= product.stock}
                      onClick={() =>
                        setQty(
                          product.id,
                          Math.min(product.stock, line.qty + 1),
                        )
                      }
                      className="grid h-10 w-10 place-items-center rounded-full text-lg font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <p className="min-w-24 text-sm font-bold sm:text-end">
                    {formatEgp(product.price * line.qty, lang)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="min-h-11 text-sm font-semibold text-error"
                  >
                    {lang === "ar" ? "حذف" : "Remove"}
                  </button>
                </div>
              </article>
            ))}

            <div className="fixed inset-x-0 bottom-[4.25rem] z-30 border-t border-line bg-background/95 p-3 backdrop-blur-md lg:static lg:bottom-auto lg:z-auto lg:mt-2 lg:rounded-3xl lg:border lg:bg-card lg:p-6 lg:shadow-none lg:backdrop-blur-none">
              <div className="mx-auto flex max-w-5xl items-center gap-3 lg:block">
                <div className="min-w-0 flex-1 lg:mb-5 lg:flex lg:items-center lg:justify-between">
                  <span className="block text-[11px] text-muted lg:text-lg lg:font-bold lg:text-foreground">
                    {lang === "ar" ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span className="block truncate text-sm font-extrabold text-primary lg:text-lg">
                    {formatEgp(subtotal, lang)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover lg:w-full lg:flex-none"
                >
                  {lang === "ar" ? "إتمام الطلب" : "Checkout"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
