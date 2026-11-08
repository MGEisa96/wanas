"use client";

import { useEffect } from "react";

export default function GlobalError({
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
        message: error.message || "Global error",
        stack: error.stack,
        source: "client",
        path: window.location.pathname,
        digest: error.digest,
        status: 500,
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="grid min-h-screen place-items-center bg-black px-4 text-white">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-extrabold">الموقع واجه مشكلة</h1>
          <p className="text-sm text-white/70">حدّث الصفحة أو ارجع بعد لحظات.</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
