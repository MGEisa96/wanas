"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useUi } from "@/lib/ui";

const ITEMS = [
  { href: "/", ar: "الرئيسية", en: "Home", icon: "home" },
  { href: "/shop", ar: "المتجر", en: "Shop", icon: "shop" },
  { href: "/cart", ar: "السلة", en: "Cart", icon: "cart" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useUi();
  const { count } = useCart();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label={lang === "ar" ? "التنقل" : "Navigation"}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-3 px-2 pt-1.5 pb-2">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-bold transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-secondary"
                }`}
              >
                <NavIcon name={item.icon} active={active} />
                <span>{lang === "ar" ? item.ar : item.en}</span>
                {item.icon === "cart" && count > 0 ? (
                  <span className="absolute top-1 end-3 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({
  name,
  active,
}: {
  name: "home" | "shop" | "cart";
  active: boolean;
}) {
  const stroke = active ? "currentColor" : "currentColor";
  if (name === "home") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "shop") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h16l-1.2 12.2A2 2 0 0 1 16.81 21H7.19a2 2 0 0 1-1.99-1.8L4 7Z"
          stroke={stroke}
          strokeWidth="1.8"
        />
        <path
          d="M8 7a4 4 0 0 1 8 0"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 5h2l1.6 9.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.55L20.5 8H7"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.3" fill={stroke} />
      <circle cx="17" cy="20" r="1.3" fill={stroke} />
    </svg>
  );
}
