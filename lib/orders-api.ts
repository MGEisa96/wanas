import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import {
  ORDERS_COLLECTION,
  PRODUCTS_COLLECTION,
  STORE_DOC,
  shippingForSubtotal,
  type Fulfillment,
  type Order,
  type OrderItem,
  type PaymentMethod,
  type Product,
  type StoreSettings,
} from "./commerce";
import { parseProduct, parseStoreSettings } from "./commerce-store";
import { isValidEgyptMobile, normalizeEgyptMobile } from "./phone";
import { defaultStoreSettings } from "./seed";

export type PlaceOrderInput = {
  items: Array<{ productId: string; qty: number }>;
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
  };
  fulfillment: Fulfillment;
  paymentMethod: PaymentMethod;
  lang: "ar" | "en";
};

function newOrderId() {
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function orderNumber() {
  const stamp = new Date();
  const y = stamp.getFullYear().toString().slice(-2);
  const m = String(stamp.getMonth() + 1).padStart(2, "0");
  const d = String(stamp.getDate()).padStart(2, "0");
  const r = Math.floor(Math.random() * 900 + 100);
  return `W${y}${m}${d}-${r}`;
}

async function readStore(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), ...STORE_DOC));
    if (!snap.exists()) return defaultStoreSettings();
    return parseStoreSettings(snap.data());
  } catch {
    return defaultStoreSettings();
  }
}

async function readProductsByIds(ids: string[]): Promise<Map<string, Product>> {
  const map = new Map<string, Product>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), PRODUCTS_COLLECTION, id));
        if (snap.exists()) {
          map.set(id, parseProduct(snap.id, snap.data() as Record<string, unknown>));
        }
      } catch {
        /* seed fallback handled by caller */
      }
    }),
  );
  return map;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const name = input.customer.name.trim();
  const phone = normalizeEgyptMobile(input.customer.phone);
  if (!name || name.length > 120) throw new Error("invalid_name");
  if (!isValidEgyptMobile(phone)) {
    throw new Error("invalid_phone");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("empty_cart");
  }

  const settings = await readStore();
  const ids = [...new Set(input.items.map((item) => item.productId))];
  let products = await readProductsByIds(ids);

  if (products.size === 0) {
    const { seedProducts } = await import("./seed");
    for (const product of seedProducts()) {
      if (ids.includes(product.id)) products.set(product.id, product);
    }
  }

  const lineItems: OrderItem[] = [];
  for (const line of input.items) {
    const qty = Math.floor(Number(line.qty) || 0);
    if (qty < 1 || qty > 99) throw new Error("invalid_qty");
    const product = products.get(line.productId);
    if (!product || product.status !== "active") {
      throw new Error("product_unavailable");
    }
    if (product.stock < qty) throw new Error("out_of_stock");
    lineItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      image: product.images[0] || "/assets/logo.jpeg",
    });
  }

  const fulfillment: Fulfillment =
    input.fulfillment === "pickup" ? "pickup" : "delivery";
  if (fulfillment === "delivery") {
    if (!input.customer.city.trim() || !input.customer.address.trim()) {
      throw new Error("invalid_address");
    }
  }

  let paymentMethod: PaymentMethod = "cod";
  if (input.paymentMethod === "instapay" && settings.instapay.enabled) {
    paymentMethod = "instapay";
  } else if (
    input.paymentMethod === "whatsapp" &&
    settings.whatsappCheckout.enabled
  ) {
    paymentMethod = "whatsapp";
  } else if (input.paymentMethod === "cod" && settings.cod.enabled) {
    paymentMethod = "cod";
  } else if (settings.whatsappCheckout.enabled) {
    paymentMethod = "whatsapp";
  } else if (settings.cod.enabled) {
    paymentMethod = "cod";
  } else if (settings.instapay.enabled) {
    paymentMethod = "instapay";
  }

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const shipping = shippingForSubtotal(settings, subtotal, fulfillment);
  const id = newOrderId();
  const order: Order = {
    id,
    number: orderNumber(),
    items: lineItems,
    customer: {
      name,
      phone,
      city: input.customer.city.trim(),
      address: input.customer.address.trim(),
      notes: input.customer.notes.trim().slice(0, 500),
    },
    fulfillment,
    paymentMethod,
    status: "new",
    totals: {
      subtotal,
      shipping,
      total: subtotal + shipping,
    },
    lang: input.lang === "en" ? "en" : "ar",
    createdAt: Date.now(),
  };

  try {
    await setDoc(doc(getFirebaseDb(), ORDERS_COLLECTION, id), order);
  } catch (error) {
    // Allow local demo without Firebase: still return the order object.
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("[wanas] order not persisted (Firebase unavailable)", error);
    return order;
  }

  try {
    await Promise.all(
      lineItems.map(async (item) => {
        const product = products.get(item.productId);
        if (!product) return;
        const nextStock = Math.max(0, product.stock - item.qty);
        await setDoc(
          doc(getFirebaseDb(), PRODUCTS_COLLECTION, item.productId),
          { stock: nextStock, updatedAt: Date.now() },
          { merge: true },
        );
      }),
    );
  } catch (error) {
    console.error("[wanas] order saved but stock decrement failed", error);
  }

  return order;
}

export async function listActiveProductsServer(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), PRODUCTS_COLLECTION));
    const rows = snap.docs
      .map((item) =>
        parseProduct(item.id, item.data() as Record<string, unknown>),
      )
      .filter((p) => p.status === "active");
    if (rows.length) return rows;
  } catch {
    /* fall through */
  }
  const { seedProducts } = await import("./seed");
  return seedProducts().filter((p) => p.status === "active");
}
