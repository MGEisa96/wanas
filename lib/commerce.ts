import type { Copy } from "./copy";

export type ProductStatus = "active" | "draft";

export type Product = {
  id: string;
  name: Copy;
  slug: string;
  description: Copy;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryIds: string[];
  stock: number;
  status: ProductStatus;
  tags: string[];
  featured: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Category = {
  id: string;
  name: Copy;
  slug: string;
  sort: number;
  visible: boolean;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "done"
  | "cancelled";

export type Fulfillment = "delivery" | "pickup";
export type PaymentMethod = "cod" | "instapay" | "whatsapp";

export type OrderItem = {
  productId: string;
  name: Copy;
  price: number;
  qty: number;
  image: string;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
};

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  total: number;
};

export type Order = {
  id: string;
  number: string;
  items: OrderItem[];
  customer: OrderCustomer;
  fulfillment: Fulfillment;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totals: OrderTotals;
  lang: "ar" | "en";
  createdAt: number;
};

export type StoreSettings = {
  brand: { name: Copy; tagline: Copy; logo: string };
  phones: { primary: string; whatsapp: string };
  seo: { title: string; description: string };
  shipping: { flatFee: number; freeOver: number; enabled: boolean };
  instapay: { enabled: boolean; number: string; instructions: Copy };
  cod: { enabled: boolean; note: Copy };
  whatsappCheckout: { enabled: boolean };
  featuredProductIds: string[];
  hero: {
    eyebrow: Copy;
    title: Copy;
    subtitle: Copy;
    cta: Copy;
    image: string;
  };
  footerNote: Copy;
};

export const PRODUCTS_COLLECTION = "products";
export const CATEGORIES_COLLECTION = "categories";
export const ORDERS_COLLECTION = "orders";
export const STORE_DOC = ["config", "store"] as const;

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "shipped",
  "done",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, Copy> = {
  new: { ar: "جديد", en: "New" },
  confirmed: { ar: "مؤكد", en: "Confirmed" },
  preparing: { ar: "قيد التجهيز", en: "Preparing" },
  shipped: { ar: "تم الشحن", en: "Shipped" },
  done: { ar: "مكتمل", en: "Done" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
};

export const PAYMENT_LABELS: Record<PaymentMethod, Copy> = {
  cod: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  instapay: { ar: "إنستاباي", en: "InstaPay" },
  whatsapp: { ar: "تأكيد عبر واتساب", en: "Confirm on WhatsApp" },
};

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `item-${Date.now().toString(36)}`;
}

export function formatEgp(value: number, lang: "ar" | "en") {
  return lang === "ar"
    ? `${value.toLocaleString("ar-EG")} جنيه`
    : `${value.toLocaleString("en-EG")} EGP`;
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("20")
    ? digits
    : digits.startsWith("0")
      ? `20${digits.slice(1)}`
      : digits;
  return `tel:+${international}`;
}

export function waLink(text?: string, whatsapp?: string) {
  const digits = (whatsapp ?? "201061381439").replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function productImage(product: Pick<Product, "images">) {
  const first = (product.images || []).find(
    (url) => typeof url === "string" && url.trim().length > 0,
  );
  return first?.trim() || "/assets/logo.jpeg";
}

export function shippingForSubtotal(
  settings: StoreSettings,
  subtotal: number,
  fulfillment: Fulfillment,
) {
  if (fulfillment === "pickup" || !settings.shipping.enabled) return 0;
  if (settings.shipping.freeOver > 0 && subtotal >= settings.shipping.freeOver) {
    return 0;
  }
  return Math.max(0, settings.shipping.flatFee);
}

export function orderWhatsAppMessage(order: Order, brandName: string) {
  const lines =
    order.lang === "ar"
      ? [
          `طلب جديد من ${brandName}`,
          `رقم الطلب: ${order.number}`,
          `الاسم: ${order.customer.name}`,
          `الموبايل: ${order.customer.phone}`,
          `الاستلام: ${order.fulfillment === "delivery" ? "توصيل" : "من الورشة"}`,
          order.fulfillment === "delivery"
            ? `العنوان: ${order.customer.city} — ${order.customer.address}`
            : "",
          `الدفع: ${PAYMENT_LABELS[order.paymentMethod].ar}`,
          "",
          "المنتجات:",
          ...order.items.map(
            (item) =>
              `• ${item.name.ar} × ${item.qty} = ${formatEgp(item.price * item.qty, "ar")}`,
          ),
          "",
          `الإجمالي: ${formatEgp(order.totals.total, "ar")}`,
          order.customer.notes ? `ملاحظات: ${order.customer.notes}` : "",
        ]
      : [
          `New order from ${brandName}`,
          `Order #: ${order.number}`,
          `Name: ${order.customer.name}`,
          `Phone: ${order.customer.phone}`,
          `Fulfillment: ${order.fulfillment}`,
          order.fulfillment === "delivery"
            ? `Address: ${order.customer.city} — ${order.customer.address}`
            : "",
          `Payment: ${PAYMENT_LABELS[order.paymentMethod].en}`,
          "",
          "Items:",
          ...order.items.map(
            (item) =>
              `• ${item.name.en} × ${item.qty} = ${formatEgp(item.price * item.qty, "en")}`,
          ),
          "",
          `Total: ${formatEgp(order.totals.total, "en")}`,
          order.customer.notes ? `Notes: ${order.customer.notes}` : "",
        ];
  return lines.filter(Boolean).join("\n");
}
