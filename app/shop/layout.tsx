import { Suspense, type ReactNode } from "react";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<ShopSkeleton />}>{children}</Suspense>;
}
