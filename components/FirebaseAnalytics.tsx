"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/analytics";

export function FirebaseAnalytics() {
  useEffect(() => {
    getFirebaseAnalytics().catch(() => undefined);
  }, []);

  return null;
}
