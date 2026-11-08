import type { Analytics } from "firebase/analytics";
import { getFirebaseApp } from "./firebase";

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseAnalytics() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const { getAnalytics, isSupported } = await import("firebase/analytics");
      if (!(await isSupported())) return null;
      return getAnalytics(getFirebaseApp());
    })().catch(() => null);
  }
  return analyticsPromise;
}

export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, name, params);
}
