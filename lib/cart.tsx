"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "wanas-cart";
const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((line) => ({
        productId: String(line.productId || ""),
        qty: Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1))),
      }))
      .filter((line) => line.productId);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((productId: string, qty = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) =>
          line.productId === productId
            ? { ...line, qty: Math.min(99, line.qty + qty) }
            : line,
        );
      }
      return [...current, { productId, qty: Math.min(99, Math.max(1, qty)) }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const next = Math.floor(qty);
    if (next < 1) {
      setLines((current) => current.filter((line) => line.productId !== productId));
      return;
    }
    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, qty: Math.min(99, next) }
          : line,
      ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
