"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_LABELS,
  formatEgp,
  slugify,
  waLink,
  type Category,
  type Order,
  type OrderStatus,
  type Product,
  type StoreSettings,
} from "@/lib/commerce";
import { useStore } from "@/lib/store";
import {
  deleteCategory,
  deleteOrder,
  deleteProduct,
  saveCategory,
  saveProduct,
  saveStoreSettings,
  seedCatalogIfEmpty,
  subscribeCategories,
  subscribeOrders,
  subscribeProducts,
  subscribeStoreSettings,
  updateOrderStatus,
} from "@/lib/commerce-store";
import { defaultStoreSettings } from "@/lib/seed";
import { emptyCopy, pickCopy } from "@/lib/copy";
import { getFirebaseAuth } from "@/lib/firebase";
import { isOwnerEmail } from "@/lib/owner";
import {
  roleLabel,
  roleOfEmail,
  touchCurrentAdmin,
} from "@/lib/admins";
import { ErrorsTab } from "./ErrorsTab";
import { LogsTab } from "./LogsTab";
import { UsersTab } from "./UsersTab";
import { ImageField } from "./ImageField";
import { MultiImageField } from "./MultiImageField";
import {
  CheckIcon,
  CopyIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { formatEgyptPhoneDisplay } from "@/lib/phone";
import { AddButton, Area, BiField, Card, Field, Group, Toggle } from "./fields";

const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  new: "bg-warning/15 text-warning ring-warning/25",
  confirmed: "bg-primary/10 text-primary ring-primary/25",
  preparing: "bg-chip text-foreground ring-line",
  shipped: "bg-primary/15 text-primary ring-primary/30",
  done: "bg-success/15 text-success ring-success/25",
  cancelled: "bg-error/10 text-error ring-error/25",
};

const ORDER_ACCENT: Record<OrderStatus, string> = {
  new: "bg-warning",
  confirmed: "bg-primary",
  preparing: "bg-foreground-secondary",
  shipped: "bg-primary",
  done: "bg-success",
  cancelled: "bg-error",
};

const ORDER_PIPELINE: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "shipped",
  "done",
];

const TABS = [
  { id: "overview", ar: "نظرة عامة" },
  { id: "orders", ar: "الطلبات" },
  { id: "products", ar: "المنتجات" },
  { id: "categories", ar: "التصنيفات" },
  { id: "settings", ar: "إعدادات المتجر" },
  { id: "users", ar: "المستخدمون" },
  { id: "logs", ar: "السجل" },
  { id: "errors", ar: "أخطاء التشغيل" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DashboardApp() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [boot, setBoot] = useState(true);
  const [tab, setTab] = useState<TabId>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const seenOrderIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setBoot(false);
      if (!next) router.replace("/dashboard/login");
      else {
        void touchCurrentAdmin(next.uid, next.email || "");
        void seedCatalogIfEmpty().catch(() => undefined);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeProducts(setProducts),
      subscribeCategories(setCategories),
      subscribeOrders(setOrders),
      subscribeStoreSettings(setSettings),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!seenOrderIds.current) {
      seenOrderIds.current = new Set(orders.map((o) => o.id));
      return;
    }
    const fresh = orders.filter((o) => !seenOrderIds.current!.has(o.id));
    if (fresh.length) {
      for (const order of fresh) seenOrderIds.current.add(order.id);
      const newest = [...fresh].sort((a, b) => b.createdAt - a.createdAt)[0];
      setToast(
        `طلب جديد ${newest.number} · ${newest.customer.name} · ${formatEgp(newest.totals.total, "ar")}`,
      );
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("طلب جديد — ونس", {
            body: `${newest.number} · ${newest.customer.name}`,
          });
        }
      } catch {
        /* ignore */
      }
    }
  }, [orders, user]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const owner = isOwnerEmail(user?.email);
  const visibleTabs = TABS.filter((item) => {
    if (item.id === "logs" && !owner) return false;
    return true;
  });

  const stats = useMemo(() => {
    const open = orders.filter((o) =>
      ["new", "confirmed", "preparing", "shipped"].includes(o.status),
    ).length;
    const revenue = orders
      .filter((o) =>
        ["confirmed", "preparing", "shipped", "done"].includes(o.status),
      )
      .reduce((sum, o) => sum + o.totals.total, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
    return { open, revenue, lowStock, products: products.length };
  }, [orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),
    [orders],
  );
  const lowStockItems = useMemo(
    () =>
      products
        .filter((p) => p.stock > 0 && p.stock <= 3)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6),
    [products],
  );
  const newOrders = orders.filter((o) => o.status === "new").length;

  if (boot || !user) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-20 lg:pb-0">
      {toast ? (
        <button
          type="button"
          onClick={() => {
            setTab("orders");
            setToast("");
          }}
          className="fixed inset-x-3 top-3 z-50 mx-auto max-w-lg rounded-2xl border border-primary/30 bg-primary px-4 py-3 text-start text-sm font-bold text-white shadow-lg sm:inset-x-auto sm:end-4 sm:start-auto"
        >
          {toast}
          <span className="mt-1 block text-xs font-semibold text-white/80">
            اضغطي لفتح الطلبات
          </span>
        </button>
      ) : null}
      <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="min-w-0">
            <p className="text-xs text-muted">لوحة ونس</p>
            <h1 className="truncate text-lg font-extrabold sm:text-xl">
              إدارة المتجر
            </h1>
            <p className="truncate text-xs text-muted">
              {user.email} · {roleLabel(roleOfEmail(user.email || ""))}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {newOrders > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setTab("orders");
                  if (
                    typeof Notification !== "undefined" &&
                    Notification.permission === "default"
                  ) {
                    void Notification.requestPermission();
                  }
                }}
                className="rounded-full bg-primary px-3 py-2 text-xs font-bold text-white sm:px-4 sm:text-sm"
              >
                طلبات جديدة {newOrders}
              </button>
            ) : null}
            <Link
              href="/"
              className="hidden min-h-11 items-center rounded-full border border-line px-4 py-2 text-sm font-bold sm:inline-flex"
            >
              عرض المتجر
            </Link>
            <button
              type="button"
              onClick={() => void signOut(getFirebaseAuth())}
              className="min-h-11 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[15rem_1fr]">
        <nav className="hidden flex-col gap-2 lg:flex">
          {visibleTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-2xl px-4 py-3 text-start text-sm font-bold ${
                tab === item.id
                  ? "bg-primary text-white shadow-sm"
                  : "border border-line bg-card hover:border-primary/40"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                {item.ar}
                {item.id === "orders" && newOrders > 0 ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/20 px-1.5 text-[10px]">
                    {newOrders}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {message ? (
            <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
              {message}
            </p>
          ) : null}

          {tab === "overview" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <Stat
                  label="طلبات مفتوحة"
                  value={String(stats.open)}
                  onClick={() => setTab("orders")}
                />
                <Stat
                  label="إيراد مؤكد+"
                  value={formatEgp(stats.revenue, "ar")}
                />
                <Stat
                  label="منتجات"
                  value={String(stats.products)}
                  onClick={() => setTab("products")}
                />
                <Stat
                  label="مخزون منخفض"
                  value={String(stats.lowStock)}
                  tone={stats.lowStock > 0 ? "warn" : "default"}
                  onClick={() => setTab("products")}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setTab("orders")}
                  className="min-h-12 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold transition hover:border-primary/40"
                >
                  الطلبات
                  {newOrders > 0 ? (
                    <span className="ms-2 rounded-full bg-error px-2 py-0.5 text-[10px] text-white">
                      {newOrders} جديد
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("products")}
                  className="min-h-12 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold transition hover:border-primary/40"
                >
                  إدارة المنتجات
                </button>
                <button
                  type="button"
                  onClick={() => setTab("settings")}
                  className="min-h-12 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold transition hover:border-primary/40"
                >
                  إعدادات المتجر
                </button>
              </div>

              <Group title={{ ar: "آخر الطلبات", en: "Recent orders" }}>
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => setTab("orders")}
                        className="min-w-0 text-start"
                      >
                        <p className="truncate font-bold">
                          {order.number} · {order.customer.name}
                        </p>
                        <p className="text-xs text-muted" dir="ltr">
                          {order.customer.phone}
                        </p>
                      </button>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold">
                          {ORDER_STATUS_LABELS[order.status].ar}
                        </span>
                        <span className="font-bold text-primary">
                          {formatEgp(order.totals.total, "ar")}
                        </span>
                        {order.status === "new" ? (
                          <button
                            type="button"
                            onClick={() =>
                              void updateOrderStatus(order.id, "confirmed").then(
                                () => setMessage("تم تأكيد الطلب"),
                              )
                            }
                            className="min-h-10 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white"
                          >
                            تأكيد
                          </button>
                        ) : null}
                        <a
                          href={waLink(
                            `مرحباً ${order.customer.name}، بخصوص طلبك ${order.number} من ونس`,
                            order.customer.phone.startsWith("01")
                              ? `20${order.customer.phone.slice(1)}`
                              : settings.phones.whatsapp,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-whatsapp px-3 py-1.5 text-xs font-bold text-white"
                          title="واتساب"
                          aria-label="واتساب"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          واتساب
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </Group>

              <Group title={{ ar: "مخزون يحتاج متابعة", en: "Low stock" }}>
                {lowStockItems.length === 0 ? (
                  <p className="text-sm text-muted">المخزون مستقر حالياً.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {lowStockItems.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setTab("products")}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 text-start"
                      >
                        <span className="truncate text-sm font-bold">
                          {product.name.ar}
                        </span>
                        <span className="shrink-0 rounded-full bg-warning/20 px-2.5 py-1 text-xs font-bold text-warning">
                          {product.stock} متبقي
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Group>
            </div>
          ) : null}

          {tab === "orders" ? (
            <OrdersPanel
              orders={orders}
              owner={owner}
              onStatus={async (id, status) => {
                await updateOrderStatus(id, status);
                setMessage("تم تحديث حالة الطلب");
              }}
              onDelete={async (id) => {
                await deleteOrder(id);
                setMessage("تم حذف الطلب");
              }}
            />
          ) : null}

          {tab === "products" ? (
            <ProductsPanel
              products={products}
              categories={categories}
              saving={saving}
              onSave={async (product) => {
                setSaving(true);
                try {
                  await saveProduct(product);
                  setMessage("تم حفظ المنتج");
                } finally {
                  setSaving(false);
                }
              }}
              onDelete={async (id) => {
                await deleteProduct(id);
                setMessage("تم حذف المنتج");
              }}
            />
          ) : null}

          {tab === "categories" ? (
            <CategoriesPanel
              categories={categories}
              onSave={async (category) => {
                await saveCategory(category);
                setMessage("تم حفظ التصنيف");
              }}
              onDelete={async (id) => {
                await deleteCategory(id);
                setMessage("تم حذف التصنيف");
              }}
            />
          ) : null}

          {tab === "settings" ? (
            <SettingsPanel
              settings={settings}
              products={products}
              saving={saving}
              onChange={setSettings}
              onSave={async () => {
                setSaving(true);
                try {
                  await saveStoreSettings(settings);
                  setMessage("تم حفظ إعدادات المتجر");
                } finally {
                  setSaving(false);
                }
              }}
            />
          ) : null}

          {tab === "users" ? (
            <UsersTab
              currentEmail={user.email || ""}
              currentUid={user.uid}
            />
          ) : null}
          {tab === "logs" && owner ? <LogsTab /> : null}
          {tab === "errors" ? <ErrorsTab isOwner={owner} /> : null}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 py-2">
          {visibleTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative min-h-11 shrink-0 rounded-2xl px-3 py-2 text-xs font-bold ${
                  tab === item.id
                    ? "bg-primary text-white"
                    : "border border-line bg-background"
                }`}
              >
                {item.ar}
                {item.id === "orders" && newOrders > 0 ? (
                  <span className="absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[9px] text-white">
                    {newOrders}
                  </span>
                ) : null}
              </button>
            ))}
        </div>
      </nav>
    </div>
  );
}

function Stat({
  label,
  value,
  onClick,
  tone = "default",
}: {
  label: string;
  value: string;
  onClick?: () => void;
  tone?: "default" | "warn";
}) {
  const className = `rounded-3xl border p-4 text-start sm:p-5 ${
    tone === "warn"
      ? "border-warning/40 bg-warning/10"
      : "border-line bg-card"
  } ${onClick ? "transition hover:border-primary/40" : ""}`;
  const body = (
    <>
      <p className="text-xs text-muted sm:text-sm">{label}</p>
      <p
        className={`mt-2 text-xl font-extrabold sm:text-2xl ${
          tone === "warn" ? "text-warning" : "text-primary"
        }`}
      >
        {value}
      </p>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }
  return <div className={className}>{body}</div>;
}

function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  const flow: Partial<Record<OrderStatus, OrderStatus[]>> = {
    new: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["shipped", "cancelled"],
    shipped: ["done"],
  };
  return flow[status] || [];
}

function relativeTimeAr(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} ي`;
  return new Date(ts).toLocaleDateString("ar-EG", { dateStyle: "medium" });
}

function OrdersPanel({
  orders,
  owner,
  onStatus,
  onDelete,
}: {
  orders: Order[];
  owner: boolean;
  onStatus: (id: string, status: OrderStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { settings } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const counts = useMemo(() => {
    const map = Object.fromEntries(
      ORDER_STATUSES.map((s) => [s, 0]),
    ) as Record<OrderStatus, number>;
    for (const o of orders) map[o.status] += 1;
    return map;
  }, [orders]);

  const rows = orders
    .filter((o) => (filter === "all" ? true : o.status === filter))
    .filter((o) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        o.number.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Group title={{ ar: "الطلبات", en: "Orders" }}>
      <div className="rounded-2xl border border-line bg-card p-3 sm:p-4">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالاسم / الموبايل / رقم الطلب / المدينة"
            className="min-h-12 w-full rounded-2xl border border-input-border bg-input-background pe-4 ps-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${
              filter === "all"
                ? "bg-primary text-white shadow-sm"
                : "border border-line bg-background text-foreground-secondary hover:border-primary/40"
            }`}
          >
            الكل
            <span className="ms-1.5 tabular-nums opacity-80">
              {orders.length}
            </span>
          </button>
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                filter === status
                  ? "bg-primary text-white shadow-sm"
                  : "border border-line bg-background text-foreground-secondary hover:border-primary/40"
              }`}
            >
              {ORDER_STATUS_LABELS[status].ar}
              <span className="ms-1.5 tabular-nums opacity-80">
                {counts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card/60 px-4 py-10 text-center">
          <p className="text-sm font-bold">لا توجد طلبات مطابقة</p>
          <p className="mt-1 text-xs text-muted">
            جرّبي فلترًا آخر أو امسحي البحث
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted">
            عرض {rows.length} من {orders.length}
          </p>
          {rows.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              owner={owner}
              whatsappFallback={settings.phones.whatsapp}
              onStatus={onStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Group>
  );
}

function OrderCard({
  order,
  owner,
  whatsappFallback,
  onStatus,
  onDelete,
}: {
  order: Order;
  owner: boolean;
  whatsappFallback: string;
  onStatus: (id: string, status: OrderStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const phoneDisplay = formatEgyptPhoneDisplay(order.customer.phone);
  const waDigits = order.customer.phone.startsWith("01")
    ? `20${order.customer.phone.slice(1)}`
    : whatsappFallback;
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const next = nextOrderStatuses(order.status);
  const pipelineIndex =
    order.status === "cancelled"
      ? -1
      : ORDER_PIPELINE.indexOf(order.status);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(order.number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_12px_32px_-24px_rgba(60,40,30,0.45)]">
      <div className={`h-1.5 w-full ${ORDER_ACCENT[order.status]}`} />

      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">
              {order.number}
            </h3>
            <button
              type="button"
              onClick={() => void copyNumber()}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-line bg-background px-2.5 text-[11px] font-bold text-muted hover:text-primary"
              aria-label="نسخ رقم الطلب"
            >
              {copied ? (
                <CheckIcon className="h-3.5 w-3.5 text-success" />
              ) : (
                <CopyIcon className="h-3.5 w-3.5" />
              )}
              {copied ? "تم" : "نسخ"}
            </button>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${ORDER_STATUS_TONE[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status].ar}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-bold">{order.customer.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            {relativeTimeAr(order.createdAt)} ·{" "}
            {new Date(order.createdAt).toLocaleString("ar-EG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="rounded-2xl bg-primary/8 px-4 py-3 text-end">
          <p className="text-[11px] font-bold text-muted">الإجمالي</p>
          <p className="text-xl font-extrabold text-primary tabular-nums">
            {formatEgp(order.totals.total, "ar")}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-foreground-secondary">
            {PAYMENT_LABELS[order.paymentMethod].ar}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {itemCount} قطعة ·{" "}
            {order.fulfillment === "pickup" ? "استلام من المحل" : "توصيل"}
          </p>
        </div>
      </div>

      {order.status !== "cancelled" ? (
        <div className="mt-4 px-4 sm:px-5">
          <div className="flex items-center gap-1">
            {ORDER_PIPELINE.map((step, index) => {
              const done = pipelineIndex >= index;
              const current = pipelineIndex === index;
              return (
                <div key={step} className="flex min-w-0 flex-1 items-center gap-1">
                  <div
                    className={`h-2 flex-1 rounded-full ${
                      done ? ORDER_ACCENT[step] : "bg-line"
                    } ${current ? "ring-2 ring-primary/25" : ""}`}
                    title={ORDER_STATUS_LABELS[step].ar}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-muted">
            <span>جديد</span>
            <span>مكتمل</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 px-4 text-xs font-bold text-error sm:px-5">
          هذا الطلب ملغي
        </p>
      )}

      <div className="mt-4 grid gap-4 border-t border-line/70 px-4 py-4 sm:px-5 lg:grid-cols-2">
        <div className="space-y-2.5">
          <p className="text-[11px] font-extrabold tracking-wide text-muted">
            العميل
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${order.customer.phone}`}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-line bg-background px-2 text-xs font-bold text-primary transition hover:border-primary/40"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              اتصال
            </a>
            <a
              href={waLink(
                `مرحباً ${order.customer.name}، بخصوص طلبك ${order.number} من ونس`,
                waDigits,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] px-2 text-xs font-bold text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="h-4 w-4" />
              واتساب
            </a>
          </div>
          <p
            className="rounded-2xl border border-line bg-background px-3 py-2 text-sm font-bold text-primary"
            dir="ltr"
          >
            {phoneDisplay}
          </p>
          {(order.customer.city || order.customer.address) && (
            <p className="rounded-2xl bg-chip/70 px-3 py-2.5 text-xs leading-5 text-foreground-secondary">
              <span className="font-extrabold text-foreground">العنوان · </span>
              {[order.customer.city, order.customer.address]
                .filter(Boolean)
                .join(" — ")}
            </p>
          )}
          {order.customer.notes ? (
            <p className="rounded-2xl border border-dashed border-warning/40 bg-warning/5 px-3 py-2.5 text-xs leading-5 text-foreground-secondary">
              <span className="font-extrabold text-warning">ملاحظة · </span>
              {order.customer.notes}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <p className="text-[11px] font-extrabold tracking-wide text-muted">
            المنتجات ({itemCount})
          </p>
          {order.items.length === 0 ? (
            <p className="text-xs text-muted">لا توجد أصناف.</p>
          ) : (
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={`${order.id}-${item.productId}-${item.name.ar}`}
                  className="flex items-center gap-3 rounded-2xl border border-line/80 bg-background p-2"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-chip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/assets/logo.jpeg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {item.name.ar}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span>× {item.qty}</span>
                      <span>·</span>
                      <span>{formatEgp(item.price, "ar")} للقطعة</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-extrabold text-primary tabular-nums">
                    {formatEgp(item.price * item.qty, "ar")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-2xl bg-chip/60 px-3 py-2 text-xs text-muted">
            <div className="flex justify-between gap-3">
              <span>المنتجات</span>
              <span className="font-bold tabular-nums text-foreground">
                {formatEgp(order.totals.subtotal, "ar")}
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span>الشحن</span>
              <span className="font-bold tabular-nums text-foreground">
                {order.totals.shipping > 0
                  ? formatEgp(order.totals.shipping, "ar")
                  : "مجاني"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line/80 bg-chip/35 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap gap-2">
          {next.map((status) => {
            const cancel = status === "cancelled";
            return (
              <button
                key={status}
                type="button"
                onClick={() => void onStatus(order.id, status)}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-xs font-bold transition ${
                  cancel
                    ? "border border-error/35 bg-error/10 text-error hover:bg-error/15"
                    : "bg-primary text-white hover:bg-primary-hover"
                }`}
              >
                ← {ORDER_STATUS_LABELS[status].ar}
              </button>
            );
          })}
          {next.length === 0 ? (
            <span className="inline-flex min-h-11 items-center text-xs font-semibold text-muted">
              لا خطوات سريعة متاحة
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-background px-3 text-sm">
            <span className="text-[11px] font-bold text-muted">الحالة</span>
            <select
              value={order.status}
              onChange={(e) =>
                void onStatus(order.id, e.target.value as OrderStatus)
              }
              className="min-h-10 bg-transparent text-sm font-bold outline-none"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status].ar}
                </option>
              ))}
            </select>
          </label>
          {owner ? (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `حذف الطلب ${order.number}؟ لا يمكن التراجع.`,
                  )
                ) {
                  void onDelete(order.id);
                }
              }}
              className="min-h-11 rounded-2xl border border-error/35 px-3.5 text-sm font-bold text-error hover:bg-error/10"
            >
              حذف
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProductsPanel({
  products,
  categories,
  saving,
  onSave,
  onDelete,
}: {
  products: Product[];
  categories: Category[];
  saving: boolean;
  onSave: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Product["status"] | "low"
  >("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const rows = products
    .filter((p) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "low") return p.stock > 0 && p.stock <= 3;
      return p.status === statusFilter;
    })
    .filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.ar.toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });

  return (
    <Group title={{ ar: "المنتجات", en: "Products" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="بحث بالاسم أو الـ slug"
        className="min-h-12 w-full rounded-2xl border border-input-border bg-input-background px-4 text-sm outline-none focus:border-primary"
      />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "الكل", products.length],
            ["active", "ظاهر", products.filter((p) => p.status === "active").length],
            ["draft", "مسودة", products.filter((p) => p.status === "draft").length],
            ["low", "مخزون منخفض", lowCount],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatusFilter(id)}
            className={`min-h-10 rounded-full px-3 py-2 text-xs font-bold ${
              statusFilter === id
                ? id === "low"
                  ? "bg-warning text-white"
                  : "bg-primary text-white"
                : "border border-line"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">لا توجد منتجات مطابقة.</p>
      ) : (
        rows.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-3xl border border-line bg-card"
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0] || "/assets/logo.jpeg"}
                alt=""
                className="h-20 w-full rounded-2xl object-cover sm:h-16 sm:w-16"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{product.name.ar}</p>
                <p className="text-xs text-muted" dir="ltr">
                  {product.slug}
                </p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {formatEgp(product.price, "ar")} · مخزون {product.stock}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={product.status}
                  onChange={(e) =>
                    void onSave({
                      ...product,
                      status: e.target.value as Product["status"],
                      updatedAt: Date.now(),
                    })
                  }
                  className="min-h-11 rounded-xl border border-input-border bg-input-background px-3 text-xs font-bold"
                >
                  <option value="active">ظاهر</option>
                  <option value="draft">مسودة</option>
                </select>
                <input
                  type="number"
                  min={0}
                  defaultValue={product.stock}
                  key={`${product.id}-${product.stock}`}
                  onBlur={(e) => {
                    const stock = Math.max(0, Number(e.target.value) || 0);
                    if (stock === product.stock) return;
                    void onSave({ ...product, stock, updatedAt: Date.now() });
                  }}
                  className="min-h-11 w-20 rounded-xl border border-input-border bg-input-background px-2 text-center text-sm"
                  aria-label="المخزون"
                />
                <button
                  type="button"
                  onClick={() =>
                    setOpenId((current) =>
                      current === product.id ? null : product.id,
                    )
                  }
                  className="min-h-11 rounded-full border border-line px-4 text-xs font-bold"
                >
                  {openId === product.id ? "إغلاق" : "تعديل"}
                </button>
              </div>
            </div>
            {openId === product.id ? (
              <div className="border-t border-line p-4">
                <ProductEditor
                  product={product}
                  categories={categories}
                  saving={saving}
                  onSave={onSave}
                  onDelete={onDelete}
                />
              </div>
            ) : null}
          </div>
        ))
      )}

      <AddButton
        onClick={() => {
          const id = `product-${Date.now().toString(36)}`;
          void onSave({
            id,
            name: { ar: "منتج جديد", en: "New product" },
            slug: id,
            description: emptyCopy(),
            price: 0,
            images: ["/assets/logo.jpeg"],
            categoryIds: [],
            stock: 0,
            status: "draft",
            tags: [],
            featured: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }).then(() => setOpenId(id));
        }}
      >
        إضافة منتج
      </AddButton>
    </Group>
  );
}

function ProductEditor({
  product,
  categories,
  saving,
  onSave,
  onDelete,
}: {
  product: Product;
  categories: Category[];
  saving: boolean;
  onSave: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(product);
  useEffect(() => setDraft(product), [product]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{draft.name.ar || draft.id}</p>
        <button
          type="button"
          onClick={() => void onDelete(draft.id)}
          className="text-sm text-error"
        >
          حذف المنتج
        </button>
      </div>
      <BiField
        label="الاسم"
        value={draft.name}
        onChange={(name) =>
          setDraft((current) => ({
            ...current,
            name,
            slug: current.slug || slugify(name.en || name.ar),
          }))
        }
      />
      <Field
        label="Slug"
        value={draft.slug}
        onChange={(slug) => setDraft((current) => ({ ...current, slug }))}
      />
      <BiField
        label="الوصف"
        value={draft.description}
        onChange={(description) =>
          setDraft((current) => ({ ...current, description }))
        }
        area
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field
          label="السعر"
          type="number"
          value={draft.price}
          onChange={(price) =>
            setDraft((current) => ({ ...current, price: Number(price) || 0 }))
          }
        />
        <Field
          label="سعر قبل الخصم"
          type="number"
          value={draft.compareAtPrice ?? ""}
          onChange={(compareAtPrice) =>
            setDraft((current) => ({
              ...current,
              compareAtPrice: compareAtPrice
                ? Number(compareAtPrice) || undefined
                : undefined,
            }))
          }
        />
        <Field
          label="المخزون"
          type="number"
          value={draft.stock}
          onChange={(stock) =>
            setDraft((current) => ({ ...current, stock: Number(stock) || 0 }))
          }
        />
      </div>
      <MultiImageField
        label="صور المنتج"
        values={draft.images}
        onChange={(images) => setDraft((current) => ({ ...current, images }))}
      />
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const checked = draft.categoryIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  categoryIds: checked
                    ? current.categoryIds.filter((id) => id !== category.id)
                    : [...current.categoryIds, category.id],
                }))
              }
              className={`min-h-10 rounded-full px-3 py-1.5 text-xs font-bold ${
                checked ? "bg-primary text-white" : "border border-line"
              }`}
            >
              {category.name.ar}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          الحالة
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                status: e.target.value as Product["status"],
              }))
            }
            className="mt-1.5 min-h-11 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5"
          >
            <option value="active">ظاهر</option>
            <option value="draft">مسودة</option>
          </select>
        </label>
        <Toggle
          label="منتج مميز"
          checked={draft.featured}
          onChange={(featured) =>
            setDraft((current) => ({ ...current, featured }))
          }
        />
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave({ ...draft, updatedAt: Date.now() })}
        className="min-h-12 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
      >
        حفظ المنتج
      </button>
    </div>
  );
}

function CategoriesPanel({
  categories,
  onSave,
  onDelete,
}: {
  categories: Category[];
  onSave: (category: Category) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const sorted = [...categories]
    .sort((a, b) => a.sort - b.sort)
    .filter((category) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        category.name.ar.toLowerCase().includes(q) ||
        category.name.en.toLowerCase().includes(q) ||
        category.slug.toLowerCase().includes(q)
      );
    });

  return (
    <Group title={{ ar: "التصنيفات", en: "Categories" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحثي في التصنيفات..."
        className="min-h-12 w-full rounded-2xl border border-line bg-background px-4 text-sm outline-none focus:border-primary"
      />
      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          {categories.length === 0
            ? "لا توجد تصنيفات بعد. أضيفي أول تصنيف للمتجر."
            : "لا نتائج لهذا البحث."}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sorted.map((category) => (
            <CategoryEditor
              key={category.id}
              category={category}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      <AddButton
        onClick={() => {
          const id = `cat-${Date.now().toString(36)}`;
          void onSave({
            id,
            name: { ar: "تصنيف جديد", en: "New category" },
            slug: id,
            sort: categories.length + 1,
            visible: true,
          });
        }}
      >
        إضافة تصنيف
      </AddButton>
    </Group>
  );
}

function CategoryEditor({
  category,
  onSave,
  onDelete,
}: {
  category: Category;
  onSave: (category: Category) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(category);
  useEffect(() => setDraft(category), [category]);
  return (
    <Card
      title={draft.name.ar}
      visible={draft.visible}
      onVisibleChange={(visible) => setDraft((c) => ({ ...c, visible }))}
      onRemove={() => void onDelete(draft.id)}
    >
      <BiField
        label="الاسم"
        value={draft.name}
        onChange={(name) => setDraft((c) => ({ ...c, name }))}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Slug"
          value={draft.slug}
          onChange={(slug) => setDraft((c) => ({ ...c, slug }))}
        />
        <Field
          label="الترتيب"
          type="number"
          value={draft.sort}
          onChange={(sort) =>
            setDraft((c) => ({ ...c, sort: Number(sort) || 0 }))
          }
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onSave(draft)}
          className="min-h-11 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          حفظ التصنيف
        </button>
        <button
          type="button"
          onClick={() => {
            const next = { ...draft, visible: !draft.visible };
            setDraft(next);
            void onSave(next);
          }}
          className="min-h-11 rounded-full border border-line px-4 py-2.5 text-sm font-bold"
        >
          {draft.visible ? "إخفاء" : "إظهار"}
        </button>
      </div>
    </Card>
  );
}

function SettingsPanel({
  settings,
  products,
  saving,
  onChange,
  onSave,
}: {
  settings: StoreSettings;
  products: Product[];
  saving: boolean;
  onChange: (settings: StoreSettings) => void;
  onSave: () => Promise<void>;
}) {
  return (
    <Group title={{ ar: "إعدادات المتجر", en: "Store settings" }}>
      <BiField
        label="اسم البراند"
        value={settings.brand.name}
        onChange={(name) =>
          onChange({ ...settings, brand: { ...settings.brand, name } })
        }
      />
      <BiField
        label="الشعار النصي"
        value={settings.brand.tagline}
        onChange={(tagline) =>
          onChange({ ...settings, brand: { ...settings.brand, tagline } })
        }
      />
      <ImageField
        label="اللوجو"
        value={settings.brand.logo}
        onChange={(logo) =>
          onChange({ ...settings, brand: { ...settings.brand, logo } })
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="الهاتف"
          value={settings.phones.primary}
          onChange={(primary) =>
            onChange({
              ...settings,
              phones: { ...settings.phones, primary },
            })
          }
        />
        <Field
          label="واتساب (دولي)"
          value={settings.phones.whatsapp}
          onChange={(whatsapp) =>
            onChange({
              ...settings,
              phones: { ...settings.phones, whatsapp },
            })
          }
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Toggle
          label="تفعيل الشحن"
          checked={settings.shipping.enabled}
          onChange={(enabled) =>
            onChange({
              ...settings,
              shipping: { ...settings.shipping, enabled },
            })
          }
        />
        <Field
          label="رسوم الشحن"
          type="number"
          value={settings.shipping.flatFee}
          onChange={(flatFee) =>
            onChange({
              ...settings,
              shipping: {
                ...settings.shipping,
                flatFee: Number(flatFee) || 0,
              },
            })
          }
        />
        <Field
          label="شحن مجاني فوق"
          type="number"
          value={settings.shipping.freeOver}
          onChange={(freeOver) =>
            onChange({
              ...settings,
              shipping: {
                ...settings.shipping,
                freeOver: Number(freeOver) || 0,
              },
            })
          }
        />
      </div>
      <Toggle
        label="إنستاباي"
        checked={settings.instapay.enabled}
        onChange={(enabled) =>
          onChange({
            ...settings,
            instapay: { ...settings.instapay, enabled },
          })
        }
      />
      <Field
        label="رقم إنستاباي"
        value={settings.instapay.number}
        onChange={(number) =>
          onChange({
            ...settings,
            instapay: { ...settings.instapay, number },
          })
        }
      />
      <BiField
        label="تعليمات إنستاباي"
        value={settings.instapay.instructions}
        onChange={(instructions) =>
          onChange({
            ...settings,
            instapay: { ...settings.instapay, instructions },
          })
        }
        area
      />
      <Toggle
        label="الدفع عند الاستلام"
        checked={settings.cod.enabled}
        onChange={(enabled) =>
          onChange({ ...settings, cod: { ...settings.cod, enabled } })
        }
      />
      <BiField
        label="ملاحظة COD"
        value={settings.cod.note}
        onChange={(note) =>
          onChange({ ...settings, cod: { ...settings.cod, note } })
        }
        area
      />
      <Toggle
        label="تأكيد واتساب عند الدفع"
        checked={settings.whatsappCheckout.enabled}
        onChange={(enabled) =>
          onChange({
            ...settings,
            whatsappCheckout: { enabled },
          })
        }
      />
      <BiField
        label="هيرو — عنوان"
        value={settings.hero.title}
        onChange={(title) =>
          onChange({ ...settings, hero: { ...settings.hero, title } })
        }
      />
      <BiField
        label="هيرو — وصف"
        value={settings.hero.subtitle}
        onChange={(subtitle) =>
          onChange({ ...settings, hero: { ...settings.hero, subtitle } })
        }
        area
      />
      <ImageField
        label="صورة الهيرو"
        value={settings.hero.image}
        onChange={(image) =>
          onChange({ ...settings, hero: { ...settings.hero, image } })
        }
      />
      <div>
        <p className="mb-2 text-sm text-muted">
          منتجات الصفحة الرئيسية ({settings.featuredProductIds.length} مختارة)
        </p>
        <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-line bg-background p-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const checked = settings.featuredProductIds.includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...settings,
                    featuredProductIds: checked
                      ? settings.featuredProductIds.filter(
                          (id) => id !== product.id,
                        )
                      : [...settings.featuredProductIds, product.id],
                  })
                }
                className={`flex min-h-11 items-center gap-2 rounded-2xl px-3 py-2 text-start text-xs font-bold ${
                  checked
                    ? "bg-primary text-white"
                    : "border border-line bg-card"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0] || "/assets/logo.jpeg"}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                />
                <span className="truncate">{product.name.ar}</span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave()}
        className="min-h-12 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
      >
        حفظ الإعدادات
      </button>
    </Group>
  );
}

