"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CartIcon,
  CloseIcon,
  LangIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from "@/components/Icons";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import { pickCopy } from "@/lib/copy";
import { useUi } from "@/lib/ui";

const LINKS = [
  { href: "/", ar: "الرئيسية", en: "Home" },
  { href: "/shop", ar: "المتجر", en: "Shop" },
  { href: "/cart", ar: "السلة", en: "Cart" },
  { href: "/checkout", ar: "إتمام الطلب", en: "Checkout" },
] as const;

const iconBtn =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-line bg-card text-foreground transition hover:border-border-hover hover:bg-chip";

export function StoreHeader() {
  const pathname = usePathname();
  const { lang, toggleLang, toggleTheme, theme } = useUi();
  const { settings } = useStore();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const themeLabel =
    theme === "dark"
      ? lang === "ar"
        ? "فاتح"
        : "Light"
      : lang === "ar"
        ? "داكن"
        : "Dark";
  const langLabel = lang === "ar" ? "EN" : "عربي";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-card sm:h-11 sm:w-11">
            <Image
              src={settings.brand.logo || "/assets/logo.jpeg"}
              alt={pickCopy(settings.brand.name, lang)}
              fill
              className="object-cover"
              sizes="44px"
              priority
              loading="eager"
              fetchPriority="high"
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-lg font-extrabold tracking-tight sm:text-xl">
              {pickCopy(settings.brand.name, lang)}
            </span>
            <span className="hidden truncate text-xs text-muted sm:block">
              {pickCopy(settings.brand.tagline, lang)}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.slice(0, 3).map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-white"
                    : "text-foreground-secondary hover:bg-chip hover:text-foreground"
                }`}
              >
                {lang === "ar" ? link.ar : link.en}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className={`${iconBtn} px-3`}
            aria-label={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            title={langLabel}
          >
            <LangIcon className="h-[18px] w-[18px]" />
            <span className="text-xs font-bold">{langLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleTheme({ persist: true })}
            className={`${iconBtn} sm:px-3`}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === "dark" ? (
              <SunIcon className="h-[18px] w-[18px]" />
            ) : (
              <MoonIcon className="h-[18px] w-[18px]" />
            )}
            <span className="hidden text-xs font-bold sm:inline">{themeLabel}</span>
          </button>

          <Link
            href="/cart"
            className="relative hidden min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-hover lg:inline-flex"
            aria-label={lang === "ar" ? "السلة" : "Cart"}
          >
            <CartIcon className="h-[18px] w-[18px]" />
            <span>{lang === "ar" ? "السلة" : "Cart"}</span>
            {count > 0 ? (
              <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[10px] text-background">
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className={`${iconBtn} lg:hidden`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={lang === "ar" ? "القائمة" : "Menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close" : "Open"}</span>
            {open ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-line bg-background px-4 py-4 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-bold ${
                    active
                      ? "bg-primary text-white"
                      : "bg-card text-foreground"
                  }`}
                >
                  {link.href === "/cart" ? (
                    <CartIcon className="h-[18px] w-[18px]" />
                  ) : null}
                  <span>
                    {lang === "ar" ? link.ar : link.en}
                    {link.href === "/cart" && count > 0 ? ` (${count})` : ""}
                  </span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => toggleTheme({ persist: true })}
              className="mt-2 inline-flex items-center gap-2.5 rounded-2xl border border-line px-4 py-3.5 text-start text-sm font-bold"
            >
              {theme === "dark" ? (
                <SunIcon className="h-[18px] w-[18px]" />
              ) : (
                <MoonIcon className="h-[18px] w-[18px]" />
              )}
              <span>
                {theme === "dark"
                  ? lang === "ar"
                    ? "الوضع الفاتح"
                    : "Light mode"
                  : lang === "ar"
                    ? "الوضع الداكن"
                    : "Dark mode"}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-line px-4 py-3.5 text-start text-sm font-bold"
            >
              <LangIcon className="h-[18px] w-[18px]" />
              <span>
                {lang === "ar" ? "English" : "العربية"}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
