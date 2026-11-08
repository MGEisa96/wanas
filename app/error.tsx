"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Page error",
        stack: error.stack,
        source: "client",
        path: window.location.pathname,
        digest: error.digest,
        status: 500,
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="max-w-md space-y-3 text-center">
        <p className="text-sm text-primary">حصل خطأ</p>
        <h1 className="text-2xl font-extrabold">تعذر عرض الصفحة</h1>
        <p className="text-sm text-muted">
          جرّب تحديث الصفحة. لو تكرر الخطأ، هيسجّل في لوحة التحكم تلقائيًا.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
