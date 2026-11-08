"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EgyptPhoneField } from "@/components/shop/EgyptPhoneField";
import { StoreShell } from "@/components/shop/StoreShell";
import {
  formatEgp,
  orderWhatsAppMessage,
  shippingForSubtotal,
  waLink,
  type Fulfillment,
  type PaymentMethod,
} from "@/lib/commerce";
import { pickCopy } from "@/lib/copy";
import { useCart } from "@/lib/cart";
import { isValidEgyptMobile, normalizeEgyptMobile } from "@/lib/phone";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

export default function CheckoutPage() {
  const router = useRouter();
  const { lang } = useUi();
  const { lines, clear } = useCart();
  const { products, settings } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    settings.cod.enabled
      ? "cod"
      : settings.whatsappCheckout.enabled
        ? "whatsapp"
        : "instapay",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const rows = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((p) => p.id === line.productId);
          return product ? { line, product } : null;
        })
        .filter(Boolean) as Array<{
        line: { productId: string; qty: number };
        product: (typeof products)[number];
      }>,
    [lines, products],
  );

  const subtotal = rows.reduce(
    (sum, row) => sum + row.product.price * row.line.qty,
    0,
  );
  const shipping = shippingForSubtotal(settings, subtotal, fulfillment);
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const localPhone = normalizeEgyptMobile(phone);
    if (!isValidEgyptMobile(localPhone)) {
      setError(
        pickCopy(
          {
            ar: "اكتبي رقم موبايل مصري صحيح (010 / 011 / 012 / 015)",
            en: "Enter a valid Egyptian mobile (010 / 011 / 012 / 015)",
          },
          lang,
        ),
      );
      window.requestAnimationFrame(() => {
        document
          .querySelector("[role='alert']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((row) => ({
            productId: row.product.id,
            qty: row.line.qty,
          })),
          customer: { name, phone: localPhone, city, address, notes },
          fulfillment,
          paymentMethod,
          lang,
        }),
      });
      const data = (await res.json()) as {
        order?: {
          id: string;
          number: string;
          items: Array<{
            productId: string;
            name: { ar: string; en: string };
            price: number;
            qty: number;
            image: string;
          }>;
          customer: {
            name: string;
            phone: string;
            city: string;
            address: string;
            notes: string;
          };
          fulfillment: Fulfillment;
          paymentMethod: PaymentMethod;
          status: "new";
          totals: { subtotal: number; shipping: number; total: number };
          lang: "ar" | "en";
          createdAt: number;
        };
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error || "order_failed");
      }
      const order = data.order;
      sessionStorage.setItem(`wanas-order-${order.id}`, JSON.stringify(order));
      clear();
      if (order.paymentMethod === "whatsapp") {
        window.open(
          waLink(
            orderWhatsAppMessage(
              { ...order, id: order.id },
              pickCopy(settings.brand.name, lang),
            ),
            settings.phones.whatsapp,
          ),
          "_blank",
          "noopener,noreferrer",
        );
      }
      router.push(`/order/${order.id}`);
    } catch (err) {
      const code = err instanceof Error ? err.message : "order_failed";
      const messages: Record<string, { ar: string; en: string }> = {
        invalid_name: { ar: "اكتبي اسم صحيح", en: "Enter a valid name" },
        invalid_phone: {
          ar: "اكتبي رقم موبايل مصري صحيح (010 / 011 / 012 / 015)",
          en: "Enter a valid Egyptian mobile (010 / 011 / 012 / 015)",
        },
        invalid_address: {
          ar: "اكتبي المدينة والعنوان للتوصيل",
          en: "Enter city and address for delivery",
        },
        empty_cart: { ar: "السلة فاضية", en: "Cart is empty" },
        out_of_stock: { ar: "كمية غير متاحة", en: "Not enough stock" },
        product_unavailable: {
          ar: "منتج غير متاح",
          en: "Product unavailable",
        },
      };
      setError(
        pickCopy(messages[code] || { ar: "فشل إرسال الطلب", en: "Order failed" }, lang),
      );
      window.requestAnimationFrame(() => {
        document
          .querySelector("[role='alert']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (rows.length === 0) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl font-extrabold">
            {lang === "ar" ? "مفيش حاجة للدفع" : "Nothing to checkout"}
          </h1>
          <Link href="/shop" className="mt-6 inline-block font-bold text-primary">
            {lang === "ar" ? "ارجعي للمتجر" : "Back to shop"}
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-6">
        <form
          id="checkout-form"
          onSubmit={submit}
          className="space-y-5 rounded-3xl border border-line bg-card p-5 sm:p-6"
        >
          <h1 className="text-3xl font-extrabold">
            {lang === "ar" ? "إتمام الطلب" : "Checkout"}
          </h1>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={lang === "ar" ? "الاسم" : "Name"}
              value={name}
              onChange={setName}
              required
            />
            <EgyptPhoneField
              label={lang === "ar" ? "الموبايل" : "Phone"}
              value={phone}
              onChange={setPhone}
              required
              placeholder="10xxxxxxxx"
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-muted">
              {lang === "ar" ? "طريقة الاستلام" : "Fulfillment"}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Choice
                active={fulfillment === "delivery"}
                onClick={() => setFulfillment("delivery")}
                label={lang === "ar" ? "توصيل منزلي" : "Home delivery"}
              />
              <Choice
                active={fulfillment === "pickup"}
                onClick={() => setFulfillment("pickup")}
                label={lang === "ar" ? "استلام من الورشة" : "Workshop pickup"}
              />
            </div>
          </div>

          {fulfillment === "delivery" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={lang === "ar" ? "المدينة" : "City"}
                value={city}
                onChange={setCity}
                required
              />
              <Field
                label={lang === "ar" ? "العنوان" : "Address"}
                value={address}
                onChange={setAddress}
                required
              />
            </div>
          ) : null}

          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">
              {lang === "ar" ? "ملاحظات" : "Notes"}
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 outline-none focus:border-primary"
            />
          </label>

          <div>
            <p className="mb-2 text-sm text-muted">
              {lang === "ar" ? "طريقة الدفع" : "Payment"}
            </p>
            <div className="space-y-2">
              {settings.cod.enabled ? (
                <Choice
                  active={paymentMethod === "cod"}
                  onClick={() => setPaymentMethod("cod")}
                  label={lang === "ar" ? "الدفع عند الاستلام" : "Cash on delivery"}
                />
              ) : null}
              {settings.instapay.enabled ? (
                <Choice
                  active={paymentMethod === "instapay"}
                  onClick={() => setPaymentMethod("instapay")}
                  label={lang === "ar" ? "إنستاباي" : "InstaPay"}
                />
              ) : null}
              {settings.whatsappCheckout.enabled ? (
                <Choice
                  active={paymentMethod === "whatsapp"}
                  onClick={() => setPaymentMethod("whatsapp")}
                  label={
                    lang === "ar"
                      ? "تأكيد الطلب عبر واتساب"
                      : "Confirm on WhatsApp"
                  }
                />
              ) : null}
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-semibold text-error"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="hidden min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60 lg:inline-flex"
          >
            {submitting
              ? lang === "ar"
                ? "جاري الإرسال..."
                : "Placing order..."
              : lang === "ar"
                ? "تأكيد الطلب"
                : "Place order"}
          </button>
        </form>

        <aside className="h-fit rounded-3xl border border-line bg-card p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">
            {lang === "ar" ? "ملخص الطلب" : "Order summary"}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {rows.map(({ line, product }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span>
                  {pickCopy(product.name, lang)} × {line.qty}
                </span>
                <span className="font-semibold">
                  {formatEgp(product.price * line.qty, lang)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">
                {lang === "ar" ? "فرعي" : "Subtotal"}
              </span>
              <span>{formatEgp(subtotal, lang)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">
                {lang === "ar" ? "الشحن" : "Shipping"}
              </span>
              <span>
                {shipping === 0
                  ? lang === "ar"
                    ? "مجاني"
                    : "Free"
                  : formatEgp(shipping, lang)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-primary">
              <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
              <span>{formatEgp(total, lang)}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[4.25rem] z-40 border-t border-line bg-background/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted">
              {lang === "ar" ? "الإجمالي" : "Total"}
            </p>
            <p className="truncate text-sm font-extrabold text-primary">
              {formatEgp(total, lang)}
            </p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="min-h-12 flex-1 rounded-full bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting
              ? lang === "ar"
                ? "جاري الإرسال..."
                : "Placing order..."
              : lang === "ar"
                ? "تأكيد الطلب"
                : "Place order"}
          </button>
        </div>
      </div>
    </StoreShell>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <input
        required={required}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

function Choice({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-start text-sm font-semibold ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-line bg-background"
      }`}
    >
      {label}
    </button>
  );
}
