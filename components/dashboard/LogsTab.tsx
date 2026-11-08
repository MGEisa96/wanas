"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  DEFAULT_AUDIT_RETENTION_DAYS,
  MAX_AUDIT_RETENTION_DAYS,
  MIN_AUDIT_RETENTION_DAYS,
  purgeExpiredAuditLogs,
  saveAuditRetentionDays,
  subscribeAuditLogs,
  subscribeAuditRetentionDays,
  type AuditAction,
  type AuditLog,
} from "@/lib/audit";
import { Card } from "./fields";

export function LogsTab() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [days, setDays] = useState(DEFAULT_AUDIT_RETENTION_DAYS);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    purgeExpiredAuditLogs().catch(() => undefined);
    const stopLogs = subscribeAuditLogs(setRows, (cause) =>
      setError(cause.message),
    );
    const stopDays = subscribeAuditRetentionDays(setDays, (cause) =>
      setError(cause.message),
    );
    return () => {
      stopLogs();
      stopDays();
    };
  }, []);

  async function onSaveDays(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const saved = await saveAuditRetentionDays(days);
      setDays(saved);
      setStatus(`السجل هيتخزن ${saved} يوم وبعدين يتحذف.`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "فشل حفظ مدة السجل",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card title="مدة الاحتفاظ بالسجل">
        <p className="text-sm text-muted">
          بعد المدة دي السجلات تتحذف تلقائيًا. من {MIN_AUDIT_RETENTION_DAYS} لـ{" "}
          {MAX_AUDIT_RETENTION_DAYS} يوم.
        </p>
        <form onSubmit={onSaveDays} className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">عدد الأيام</span>
            <input
              type="number"
              min={MIN_AUDIT_RETENTION_DAYS}
              max={MAX_AUDIT_RETENTION_DAYS}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="min-h-12 w-32 rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ المدة"}
          </button>
        </form>
        {status ? <p className="text-sm text-primary">{status}</p> : null}
      </Card>
      <Card title="سجل التغييرات">
        <p className="text-sm text-muted">
          يظهر للمالك فقط. كل سجل بيتحذف بعد المدة المحددة فوق.
        </p>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {rows.length === 0 && !error ? (
          <p className="text-sm text-muted">لسه مفيش تغييرات مسجّلة.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li
                key={row.id}
                className="space-y-2 rounded-2xl border border-transparent py-3 sm:border-0"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="font-semibold">{row.summary}</p>
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                      {actionLabel(row.action)}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {formatWhen(row.createdAt)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted" dir="ltr">
                  {row.actorEmail}
                </p>
                {row.details.length ? (
                  <p className="text-sm leading-6">{row.details.join(" · ")}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function actionLabel(action: AuditAction) {
  switch (action) {
    case "admin.create":
      return "إضافة مستخدم";
    case "admin.remove":
      return "إزالة مستخدم";
    case "admin.password":
      return "تغيير كلمة السر";
    case "application.delete":
      return "حذف طلب حجز";
    default:
      return "حفظ محتوى";
  }
}

function formatWhen(date: Date | null) {
  if (!date) return "الآن";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
