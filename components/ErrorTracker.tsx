"use client";

import { useEffect } from "react";

function report(message: string, stack?: string) {
  const path = `${window.location.pathname}${window.location.search}`;
  void fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      stack,
      source: "client",
      path,
    }),
  }).catch(() => undefined);
}

export function ErrorTracker() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      report(event.message || "Client error", event.error?.stack);
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection";
      const stack = reason instanceof Error ? reason.stack : undefined;
      report(message, stack);
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
