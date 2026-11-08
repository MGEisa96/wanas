"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Category, Product, StoreSettings } from "./commerce";
import {
  subscribeCategories,
  subscribeProducts,
  subscribeStoreSettings,
} from "./commerce-store";
import { defaultStoreSettings } from "./seed";
import { applyColorTokens, tokensFor } from "./color-schemes";
import { defaultCustomTokens } from "./color-schemes";
import { useUi } from "./ui";

type StoreContextValue = {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  ready: boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { theme, applySiteThemePreference } = useUi();
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  // Start empty so we never flash the offline seed catalog over live Firestore data.
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    applySiteThemePreference("light");
    const tokens = tokensFor("sand", theme === "dark" ? "dark" : "light", defaultCustomTokens());
    applyColorTokens(tokens);
  }, [theme, applySiteThemePreference]);

  useEffect(() => {
    const unsubSettings = subscribeStoreSettings((next) => {
      setSettings(next);
      setReady(true);
    });
    const unsubProducts = subscribeProducts(
      (next) => setProducts(next.filter((p) => p.status === "active")),
      { activeOnly: true },
    );
    const unsubCategories = subscribeCategories(setCategories);
    return () => {
      unsubSettings();
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const value = useMemo(
    () => ({ settings, products, categories, ready }),
    [settings, products, categories, ready],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useProduct(slugOrId: string) {
  const { products } = useStore();
  return (
    products.find((p) => p.slug === slugOrId || p.id === slugOrId) || null
  );
}
