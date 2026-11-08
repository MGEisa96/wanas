"use client";

import { useEffect, useState } from "react";
import {
  deleteErrorLog,
  purgeExpiredErrorLogs,
  subscribeErrorLogs,
  type ErrorLog,
  type ErrorSource,
} from "@/lib/error-log";
import { Card } from "./fields";

export function ErrorsTab({ isOwner }: { isOwner: boolean }) {
  const [rows, setRows] = useState<ErrorLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    purgeExpiredErrorLogs().catch(() => undefined);
    return subscribeErrorLogs(setRows, (cause) => setError(cause.message));
  }, []);

  return (
    <div className="space-y-5">
      <Card title="أخطاء التشغيل">
        <p className="text-sm text-muted">
          أخطاء السيرفر والمتصفح ورفع الصور. بتتحذف بعد 14 يوم.
        </p>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {rows.length === 0 && !error ? (
          <p className="text-sm text-muted">لسه مفيش أخطاء مسجّلة.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="space-y-2 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                      {sourceLabel(row.source)}
                    </span>
                    {row.status ? (
                      <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                        {row.status}
                      </span>
                    ) : null}
                    <p className="font-semibold leading-snug">{row.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatWhen(row.createdAt)}
                  </span>
                </div>
                <p className="break-all text-xs text-muted" dir="ltr">
                  {row.path}
                </p>
                {isOwner ? (
                  <button
                    type="button"
                    className="min-h-10 text-sm font-semibold text-error"
                    onClick={() =>
                      deleteErrorLog(row.id).catch((cause) =>
                        setError(
                          cause instanceof Error
                            ? cause.message
                            : "فشل حذف الخطأ",
                        ),
                      )
                    }
                  >
                    حذف
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function sourceLabel(source: ErrorSource) {
  switch (source) {
    case "api":
      return "API";
    case "server":
      return "سيرفر";
    default:
      return "متصفح";
  }
}

function formatWhen(date: Date | null) {
  if (!date) return "الآن";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
