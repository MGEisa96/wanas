"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { StoreShell } from "@/components/shop/StoreShell";
import {
  formatEgp,
  orderWhatsAppMessage,
  PAYMENT_LABELS,
  waLink,
  type Order,
} from "@/lib/commerce";
import { pickCopy } from "@/lib/copy";
import { loadOrder } from "@/lib/commerce-store";
import { useStore } from "@/lib/store";
import { useUi } from "@/lib/ui";

export default function OrderThanksPage({
  params,
}: {
  params: Promise<{ slug?: string; id: string }>;
}) {
  const { id } = use(params);
  const { lang } = useUi();
  const { settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(`wanas-order-${id}`);
    if (cached) {
      try {
        setOrder(JSON.parse(cached) as Order);
        return;
      } catch {
        /* fall through */
      }
    }
    void loadOrder(id).then((row) => {
      if (row) setOrder(row);
      else setMissing(true);
    });
  }, [id]);

  if (missing) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-24">
          <h1 className="text-3xl font-extrabold">
            {lang === "ar" ? "الطلب غير موجود" : "Order not found"}
          </h1>
          <Link
            href="/shop"
            className="mt-6 inline-flex min-h-12 items-center font-bold text-primary"
          >
            {lang === "ar" ? "العودة للمتجر" : "Back to shop"}
          </Link>
        </div>
      </StoreShell>
    );
  }

  if (!order) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-20 text-center sm:py-24">
          <div className="mx-auto h-4 w-32 rounded bg-chip" />
          <div className="mx-auto mt-4 h-10 w-48 rounded-xl bg-chip" />
          <div className="mx-auto mt-8 h-48 max-w-md rounded-3xl bg-chip" />
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12 lg:px-6">
        <p className="text-sm font-semibold text-primary">
          {lang === "ar" ? "تم استلام طلبك" : "Order received"}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          {lang === "ar" ? "شكراً ليكي" : "Thank you"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
          {lang === "ar"
            ? `رقم الطلب ${order.number}. هنراجع التفاصيل ونتواصل معاكي.`
            : `Order ${order.number}. We’ll review the details and contact you.`}
        </p>

        <div className="mt-8 rounded-3xl border border-line bg-card p-5 sm:p-6">
          <ul className="space-y-3 text-sm">
            {order.items.map((item) => (
              <li
                key={`${item.productId}-${item.qty}`}
                className="flex justify-between gap-3"
              >
                <span>
                  {pickCopy(item.name, lang)} × {item.qty}
                </span>
                <span className="font-semibold">
                  {formatEgp(item.price * item.qty, lang)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">
                {lang === "ar" ? "الشحن" : "Shipping"}
              </span>
              <span>
                {order.totals.shipping === 0
                  ? lang === "ar"
                    ? "مجاني"
                    : "Free"
                  : formatEgp(order.totals.shipping, lang)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-primary">
              <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
              <span>{formatEgp(order.totals.total, lang)}</span>
            </div>
            <p className="pt-2 text-muted">
              {lang === "ar" ? "الدفع:" : "Payment:"}{" "}
              {pickCopy(PAYMENT_LABELS[order.paymentMethod], lang)}
            </p>
          </div>

          {order.paymentMethod === "instapay" ? (
            <div className="mt-5 rounded-2xl bg-chip p-4 text-sm">
              <p className="font-bold">InstaPay</p>
              <p className="mt-1" dir="ltr">
                {settings.instapay.number}
              </p>
              <p className="mt-2 text-muted">
                {pickCopy(settings.instapay.instructions, lang)}
              </p>
            </div>
          ) : null}

          {order.paymentMethod === "cod" ? (
            <p className="mt-5 text-sm text-muted">
              {pickCopy(settings.cod.note, lang)}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={waLink(
                orderWhatsAppMessage(order, pickCopy(settings.brand.name, lang)),
                settings.phones.whatsapp,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white"
            >
              WhatsApp
            </a>
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-bold"
            >
              {lang === "ar" ? "كمّلي تسوق" : "Continue shopping"}
            </Link>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
