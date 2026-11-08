"use client";

import type { ReactNode } from "react";
import type { Copy } from "@/lib/copy";

export function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 outline-none focus:border-primary"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 outline-none focus:border-primary"
      />
    </label>
  );
}

export function BiField({
  label,
  value,
  onChange,
  area = false,
}: {
  label: string;
  value: Copy;
  onChange: (value: Copy) => void;
  area?: boolean;
}) {
  const Control = area ? Area : Field;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Control
        label={`${label} (عربي)`}
        value={value.ar}
        onChange={(ar) => onChange({ ...value, ar })}
      />
      <Control
        label={`${label} (EN)`}
        value={value.en}
        onChange={(en) => onChange({ ...value, en })}
      />
    </div>
  );
}

export function Card({
  title,
  onRemove,
  visible,
  onVisibleChange,
  children,
}: {
  title: string;
  onRemove?: () => void;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  children: ReactNode;
}) {
  const hidden = onVisibleChange && visible === false;
  return (
    <article
      className={`space-y-4 rounded-2xl border bg-card p-4 ${
        hidden ? "border-dashed border-line opacity-80" : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold">{title}</h3>
          {hidden ? (
            <p className="mt-0.5 text-xs text-muted">مخفي عن زوار الموقع</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onVisibleChange ? (
            <VisibilitySwitch
              checked={visible !== false}
              onChange={onVisibleChange}
            />
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-error hover:underline"
            >
              حذف
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </article>
  );
}

export function Group({
  title,
  hint,
  children,
}: {
  title: Copy;
  hint?: Copy;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-line bg-background p-4 sm:p-5">
      <div className="border-b border-line pb-3">
        <h2 className="text-lg font-extrabold">{title.ar}</h2>
        <p className="text-sm text-muted">{title.en}</p>
        {hint ? (
          <div className="mt-2 space-y-0.5 text-sm text-muted">
            <p>{hint.ar}</p>
            <p>{hint.en}</p>
          </div>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-dashed border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10"
    >
      {children}
    </button>
  );
}

export function VisibilitySwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-label="الإظهار والإخفاء"
      className="inline-flex rounded-full border border-line bg-background p-0.5 text-xs font-bold"
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          checked ? "bg-primary text-white" : "text-muted hover:text-foreground"
        }`}
      >
        ظاهر
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          checked
            ? "text-muted hover:text-foreground"
            : "bg-foreground/10 text-foreground"
        }`}
      >
        مخفي
      </button>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-line bg-background px-4 py-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[inset-inline-start] ${
            checked ? "start-5" : "start-0.5"
          }`}
        />
      </button>
    </label>
  );
}
