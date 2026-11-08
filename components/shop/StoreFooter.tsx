"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  CartIcon,
  CheckIcon,
  CheckoutIcon,
  ClockIcon,
  CopyIcon,
  PhoneIcon,
  ShopIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { telHref, waLink } from "@/lib/commerce";
import { pickCopy } from "@/lib/copy";
import { formatEgyptPhoneDisplay } from "@/lib/phone";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

const SHOP_LINKS = [
  {
    href: "/shop",
    ar: "كل المنتجات",
    en: "All products",
    Icon: ShopIcon,
  },
  {
    href: "/cart",
    ar: "السلة",
    en: "Cart",
    Icon: CartIcon,
  },
  {
    href: "/checkout",
    ar: "إتمام الطلب",
    en: "Checkout",
    Icon: CheckoutIcon,
  },
] as const;

export function StoreFooter() {
  const { lang } = useUi();
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);
  const brand = pickCopy(settings.brand.name, lang);
  const phoneDisplay = formatEgyptPhoneDisplay(settings.phones.primary);
  const features = pickCopy(settings.footerNote, lang)
    .split(/[·•|]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const year = new Date().getFullYear();
  const phoneHref = telHref(settings.phones.primary);
  const waHref = waLink(
    lang === "ar"
      ? `مرحباً، عندي سؤال عن منتجات ${settings.brand.name.ar}`
      : `Hello, I have a question about ${settings.brand.name.en}`,
    settings.phones.whatsapp,
  );

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phoneDisplay);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <footer className="mt-auto border-t border-line bg-gradient-to-b from-card/80 to-background">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-line bg-card shadow-sm">
                <Image
                  src={settings.brand.logo || "/assets/logo.jpeg"}
                  alt={brand}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </span>
              <span>
                <span className="block text-2xl font-extrabold tracking-tight">
                  {brand}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {pickCopy(settings.brand.tagline, lang)}
                </span>
              </span>
            </Link>

            {features.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-full border border-line bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground-secondary"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm font-extrabold tracking-wide">
              {lang === "ar" ? "تسوقي" : "Shop"}
            </p>
            <ul className="mt-4 space-y-1">
              {SHOP_LINKS.map(({ href, ar, en, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-muted transition hover:bg-chip hover:text-primary"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-line bg-card text-foreground transition group-hover:border-primary/30 group-hover:text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold">
                      {lang === "ar" ? ar : en}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm font-extrabold tracking-wide">
              {lang === "ar" ? "تواصلي" : "Contact"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {lang === "ar"
                ? "اسألي عن المقاس، التغليف، أو حالة الطلب."
                : "Ask about sizing, gift wrap, or order status."}
            </p>

            <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-card shadow-[0_10px_30px_-24px_rgba(60,40,30,0.45)]">
              <div className="border-b border-line/80 bg-chip/50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>
                    {lang === "ar"
                      ? "الرد عادة خلال ساعات قليلة"
                      : "Usually replies within a few hours"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-2xl border border-line bg-background px-3 py-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
                      <PhoneIcon className="h-3.5 w-3.5" />
                      {lang === "ar" ? "موبايل مصر" : "Egypt mobile"}
                    </span>
                    <button
                      type="button"
                      onClick={copyPhone}
                      className="inline-flex min-h-8 items-center gap-1 rounded-full border border-line bg-card px-2.5 text-[11px] font-bold text-foreground-secondary transition hover:border-primary/40 hover:text-primary"
                      aria-label={lang === "ar" ? "نسخ الرقم" : "Copy number"}
                    >
                      {copied ? (
                        <CheckIcon className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5" />
                      )}
                      {copied
                        ? lang === "ar"
                          ? "تم"
                          : "Copied"
                        : lang === "ar"
                          ? "نسخ"
                          : "Copy"}
                    </button>
                  </div>

                  <div
                    className="flex items-center gap-2.5"
                    dir="ltr"
                  >
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-chip px-2.5 py-1.5">
                      <span className="text-base leading-none" aria-hidden>
                        🇪🇬
                      </span>
                      <span className="text-xs font-extrabold tabular-nums">
                        +20
                      </span>
                    </span>
                    <a
                      href={phoneHref}
                      className="min-w-0 flex-1 truncate text-lg font-extrabold tracking-wide text-primary tabular-nums"
                    >
                      {phoneDisplay.replace(/^\+20\s*/, "")}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={phoneHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-3 text-sm font-bold text-primary transition hover:bg-primary/15"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {lang === "ar" ? "اتصلي" : "Call"}
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-whatsapp px-3 text-sm font-bold text-white transition hover:brightness-95"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line/80 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand}
            <span className="mx-1.5 text-line">·</span>
            {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
          </p>
          <p dir="ltr" className="font-medium tracking-wide">
            🇪🇬 Egypt · Handmade store
          </p>
        </div>
      </div>
    </footer>
  );
}
