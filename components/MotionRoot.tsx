"use client";

import { useEffect, type ReactNode } from "react";

export function MotionRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
      const nodes = document.querySelectorAll(".reveal:not(.is-visible)");
      for (const el of nodes) {
        if (reduce) {
          el.classList.add("is-visible");
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 72) {
          el.classList.add("is-visible");
        }
      }
    };

    update();
    const onScroll = () => update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    const mo = new MutationObserver(update);
    mo.observe(document.body, { childList: true, subtree: true });
    const kick = window.setTimeout(update, 50);

    return () => {
      window.clearTimeout(kick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      mo.disconnect();
    };
  }, []);

  return children;
}
