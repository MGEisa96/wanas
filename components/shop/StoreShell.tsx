"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { MobileBottomNav } from "./MobileBottomNav";
import { StoreFooter } from "./StoreFooter";
import { StoreHeader } from "./StoreHeader";

export function StoreShell({ children }: { children: ReactNode }) {
  const { ready } = useStore();

  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHeader />
      {!ready ? (
        <div
          className="h-0.5 w-full overflow-hidden bg-chip"
          aria-hidden
        >
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      ) : null}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <StoreFooter />
      <MobileBottomNav />
    </div>
  );
}
