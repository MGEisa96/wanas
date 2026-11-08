import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import {
  CATEGORIES_COLLECTION,
  ORDERS_COLLECTION,
  PRODUCTS_COLLECTION,
  STORE_DOC,
  type Category,
  type Order,
  type OrderStatus,
  type Product,
  type StoreSettings,
} from "./commerce";
import { defaultStoreSettings, seedCategories, seedProducts } from "./seed";

function dbReady() {
  try {
    const cfg = getFirebaseDb();
    return Boolean(cfg);
  } catch {
    return false;
  }
}

function asCopy(value: unknown, fallback = { ar: "", en: "" }) {
  if (!value || typeof value !== "object") return fallback;
  const row = value as Record<string, unknown>;
  return {
    ar: typeof row.ar === "string" ? row.ar : fallback.ar,
    en: typeof row.en === "string" ? row.en : fallback.en,
  };
}

export function parseProduct(id: string, raw: Record<string, unknown>): Product {
  return {
    id,
    name: asCopy(raw.name),
    slug: String(raw.slug || id),
    description: asCopy(raw.description),
    price: Number(raw.price) || 0,
    compareAtPrice:
      raw.compareAtPrice === undefined || raw.compareAtPrice === null
        ? undefined
        : Number(raw.compareAtPrice) || undefined,
    images: Array.isArray(raw.images)
      ? raw.images.map(String).filter(Boolean)
      : ["/assets/logo.jpeg"],
    categoryIds: Array.isArray(raw.categoryIds)
      ? raw.categoryIds.map(String)
      : [],
    stock: Number(raw.stock) || 0,
    status: raw.status === "draft" ? "draft" : "active",
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    featured: Boolean(raw.featured),
    createdAt: Number(raw.createdAt) || Date.now(),
    updatedAt: Number(raw.updatedAt) || Date.now(),
  };
}

export function parseCategory(
  id: string,
  raw: Record<string, unknown>,
): Category {
  return {
    id,
    name: asCopy(raw.name),
    slug: String(raw.slug || id),
    sort: Number(raw.sort) || 0,
    visible: raw.visible !== false,
  };
}

export function parseOrder(id: string, raw: Record<string, unknown>): Order {
  const items = Array.isArray(raw.items) ? raw.items : [];
  const customer = (raw.customer || {}) as Record<string, unknown>;
  const totals = (raw.totals || {}) as Record<string, unknown>;
  return {
    id,
    number: String(raw.number || id),
    items: items.map((item) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        productId: String(row.productId || ""),
        name: asCopy(row.name),
        price: Number(row.price) || 0,
        qty: Number(row.qty) || 1,
        image: String(row.image || "/assets/logo.jpeg"),
      };
    }),
    customer: {
      name: String(customer.name || ""),
      phone: String(customer.phone || ""),
      city: String(customer.city || ""),
      address: String(customer.address || ""),
      notes: String(customer.notes || ""),
    },
    fulfillment: raw.fulfillment === "pickup" ? "pickup" : "delivery",
    paymentMethod:
      raw.paymentMethod === "instapay" || raw.paymentMethod === "whatsapp"
        ? raw.paymentMethod
        : "cod",
    status: (["new", "confirmed", "preparing", "shipped", "done", "cancelled"].includes(
      String(raw.status),
    )
      ? String(raw.status)
      : "new") as OrderStatus,
    totals: {
      subtotal: Number(totals.subtotal) || 0,
      shipping: Number(totals.shipping) || 0,
      total: Number(totals.total) || 0,
    },
    lang: raw.lang === "en" ? "en" : "ar",
    createdAt: Number(raw.createdAt) || Date.now(),
  };
}

export function parseStoreSettings(raw: unknown): StoreSettings {
  const base = defaultStoreSettings();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Record<string, unknown>;
  const brand = (data.brand || {}) as Record<string, unknown>;
  const phones = (data.phones || {}) as Record<string, unknown>;
  const seo = (data.seo || {}) as Record<string, unknown>;
  const shipping = (data.shipping || {}) as Record<string, unknown>;
  const instapay = (data.instapay || {}) as Record<string, unknown>;
  const cod = (data.cod || {}) as Record<string, unknown>;
  const whatsappCheckout = (data.whatsappCheckout || {}) as Record<
    string,
    unknown
  >;
  const hero = (data.hero || {}) as Record<string, unknown>;
  return {
    brand: {
      name: asCopy(brand.name, base.brand.name),
      tagline: asCopy(brand.tagline, base.brand.tagline),
      logo: String(brand.logo || base.brand.logo),
    },
    phones: {
      primary: String(phones.primary || base.phones.primary),
      whatsapp: String(phones.whatsapp || base.phones.whatsapp),
    },
    seo: {
      title: String(seo.title || base.seo.title),
      description: String(seo.description || base.seo.description),
    },
    shipping: {
      flatFee: Number(shipping.flatFee ?? base.shipping.flatFee),
      freeOver: Number(shipping.freeOver ?? base.shipping.freeOver),
      enabled: shipping.enabled !== false,
    },
    instapay: {
      enabled: instapay.enabled !== false,
      number: String(instapay.number || base.instapay.number),
      instructions: asCopy(instapay.instructions, base.instapay.instructions),
    },
    cod: {
      enabled: cod.enabled !== false,
      note: asCopy(cod.note, base.cod.note),
    },
    whatsappCheckout: {
      enabled: whatsappCheckout.enabled !== false,
    },
    featuredProductIds: Array.isArray(data.featuredProductIds)
      ? data.featuredProductIds.map(String)
      : base.featuredProductIds,
    hero: {
      eyebrow: asCopy(hero.eyebrow, base.hero.eyebrow),
      title: asCopy(hero.title, base.hero.title),
      subtitle: asCopy(hero.subtitle, base.hero.subtitle),
      cta: asCopy(hero.cta, base.hero.cta),
      image: String(hero.image || base.hero.image),
    },
    footerNote: asCopy(data.footerNote, base.footerNote),
  };
}

export async function loadStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), ...STORE_DOC));
    if (!snap.exists()) return defaultStoreSettings();
    return parseStoreSettings(snap.data());
  } catch {
    return defaultStoreSettings();
  }
}

export async function saveStoreSettings(settings: StoreSettings) {
  await setDoc(doc(getFirebaseDb(), ...STORE_DOC), settings, { merge: true });
}

export function subscribeStoreSettings(
  onData: (settings: StoreSettings) => void,
): Unsubscribe {
  try {
    const ref = doc(getFirebaseDb(), ...STORE_DOC);
    void getDoc(ref)
      .then((snap) => {
        onData(
          snap.exists()
            ? parseStoreSettings(snap.data())
            : defaultStoreSettings(),
        );
      })
      .catch((error) => {
        console.warn("[wanas] settings getDoc failed", error);
      });

    return onSnapshot(
      ref,
      (snap) => {
        onData(
          snap.exists()
            ? parseStoreSettings(snap.data())
            : defaultStoreSettings(),
        );
      },
      (error) => {
        console.warn("[wanas] settings onSnapshot failed", error);
        void getDoc(ref)
          .then((snap) => {
            onData(
              snap.exists()
                ? parseStoreSettings(snap.data())
                : defaultStoreSettings(),
            );
          })
          .catch(() => onData(defaultStoreSettings()));
      },
    );
  } catch (error) {
    console.warn("[wanas] settings subscribe setup failed", error);
    onData(defaultStoreSettings());
    return () => undefined;
  }
}

export async function loadProducts(opts?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), PRODUCTS_COLLECTION));
    let rows = snap.docs.map((item) =>
      parseProduct(item.id, item.data() as Record<string, unknown>),
    );
    if (opts?.activeOnly) rows = rows.filter((p) => p.status === "active");
    if (rows.length === 0) {
      return opts?.activeOnly
        ? seedProducts().filter((p) => p.status === "active")
        : seedProducts();
    }
    return rows.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return opts?.activeOnly
      ? seedProducts().filter((p) => p.status === "active")
      : seedProducts();
  }
}

export async function loadProductBySlug(slug: string): Promise<Product | null> {
  const products = await loadProducts({ activeOnly: true });
  return products.find((p) => p.slug === slug) || null;
}

export async function loadProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), PRODUCTS_COLLECTION, id));
    if (!snap.exists()) {
      return seedProducts().find((p) => p.id === id) || null;
    }
    return parseProduct(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return seedProducts().find((p) => p.id === id) || null;
  }
}

export function subscribeProducts(
  onData: (products: Product[]) => void,
  opts?: { activeOnly?: boolean },
): Unsubscribe {
  const normalize = (rows: Product[]) => {
    let next = rows;
    if (opts?.activeOnly) next = next.filter((p) => p.status === "active");
    if (next.length === 0) {
      next = opts?.activeOnly
        ? seedProducts().filter((p) => p.status === "active")
        : seedProducts();
    }
    return next.sort((a, b) => b.updatedAt - a.updatedAt);
  };

  try {
    const ref = collection(getFirebaseDb(), PRODUCTS_COLLECTION);

    // One-shot hydrate so storefront never stays on seed while listen boots.
    void getDocs(ref)
      .then((snap) => {
        onData(
          normalize(
            snap.docs.map((item) =>
              parseProduct(item.id, item.data() as Record<string, unknown>),
            ),
          ),
        );
      })
      .catch((error) => {
        console.warn("[wanas] products getDocs failed", error);
      });

    return onSnapshot(
      ref,
      (snap) => {
        onData(
          normalize(
            snap.docs.map((item) =>
              parseProduct(item.id, item.data() as Record<string, unknown>),
            ),
          ),
        );
      },
      (error) => {
        console.warn("[wanas] products onSnapshot failed", error);
        void getDocs(ref)
          .then((snap) => {
            onData(
              normalize(
                snap.docs.map((item) =>
                  parseProduct(item.id, item.data() as Record<string, unknown>),
                ),
              ),
            );
          })
          .catch(() => {
            onData(
              normalize(
                opts?.activeOnly
                  ? seedProducts().filter((p) => p.status === "active")
                  : seedProducts(),
              ),
            );
          });
      },
    );
  } catch (error) {
    console.warn("[wanas] products subscribe setup failed", error);
    onData(
      normalize(
        opts?.activeOnly
          ? seedProducts().filter((p) => p.status === "active")
          : seedProducts(),
      ),
    );
    return () => undefined;
  }
}

export async function saveProduct(product: Product) {
  const { id, ...data } = product;
  await setDoc(
    doc(getFirebaseDb(), PRODUCTS_COLLECTION, id),
    { ...data, updatedAt: Date.now() },
    { merge: true },
  );
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(getFirebaseDb(), PRODUCTS_COLLECTION, id));
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(getFirebaseDb(), CATEGORIES_COLLECTION));
    const rows = snap.docs.map((item) =>
      parseCategory(item.id, item.data() as Record<string, unknown>),
    );
    if (rows.length === 0) return seedCategories();
    return rows.sort((a, b) => a.sort - b.sort);
  } catch {
    return seedCategories();
  }
}

export function subscribeCategories(
  onData: (categories: Category[]) => void,
): Unsubscribe {
  const normalize = (rows: Category[]) =>
    (rows.length ? rows : seedCategories()).sort((a, b) => a.sort - b.sort);

  try {
    const ref = collection(getFirebaseDb(), CATEGORIES_COLLECTION);
    void getDocs(ref)
      .then((snap) => {
        onData(
          normalize(
            snap.docs.map((item) =>
              parseCategory(item.id, item.data() as Record<string, unknown>),
            ),
          ),
        );
      })
      .catch((error) => {
        console.warn("[wanas] categories getDocs failed", error);
      });

    return onSnapshot(
      ref,
      (snap) => {
        onData(
          normalize(
            snap.docs.map((item) =>
              parseCategory(item.id, item.data() as Record<string, unknown>),
            ),
          ),
        );
      },
      (error) => {
        console.warn("[wanas] categories onSnapshot failed", error);
        void getDocs(ref)
          .then((snap) => {
            onData(
              normalize(
                snap.docs.map((item) =>
                  parseCategory(
                    item.id,
                    item.data() as Record<string, unknown>,
                  ),
                ),
              ),
            );
          })
          .catch(() => onData(seedCategories()));
      },
    );
  } catch (error) {
    console.warn("[wanas] categories subscribe setup failed", error);
    onData(seedCategories());
    return () => undefined;
  }
}

export async function saveCategory(category: Category) {
  const { id, ...data } = category;
  await setDoc(doc(getFirebaseDb(), CATEGORIES_COLLECTION, id), data, {
    merge: true,
  });
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(getFirebaseDb(), CATEGORIES_COLLECTION, id));
}

export function subscribeOrders(onData: (orders: Order[]) => void): Unsubscribe {
  try {
    const q = query(
      collection(getFirebaseDb(), ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        onData(
          snap.docs.map((item) =>
            parseOrder(item.id, item.data() as Record<string, unknown>),
          ),
        );
      },
      () => onData([]),
    );
  } catch {
    onData([]);
    return () => undefined;
  }
}

export async function loadOrder(id: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), ORDERS_COLLECTION, id));
    if (!snap.exists()) return null;
    return parseOrder(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await setDoc(
    doc(getFirebaseDb(), ORDERS_COLLECTION, id),
    { status },
    { merge: true },
  );
}

export async function deleteOrder(id: string) {
  await deleteDoc(doc(getFirebaseDb(), ORDERS_COLLECTION, id));
}

export async function seedCatalogIfEmpty() {
  if (!dbReady()) return;
  const products = await getDocs(collection(getFirebaseDb(), PRODUCTS_COLLECTION));
  if (products.empty) {
    await Promise.all(seedProducts().map((p) => saveProduct(p)));
  }
  const categories = await getDocs(
    collection(getFirebaseDb(), CATEGORIES_COLLECTION),
  );
  if (categories.empty) {
    await Promise.all(seedCategories().map((c) => saveCategory(c)));
  }
  const store = await getDoc(doc(getFirebaseDb(), ...STORE_DOC));
  if (!store.exists()) {
    await saveStoreSettings(defaultStoreSettings());
  }
}
