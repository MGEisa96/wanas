"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { LogoMark } from "@/components/Icons";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    if (!sessionStorage.getItem("dashboardRemoved")) return "";
    sessionStorage.removeItem("dashboardRemoved");
    return "تم إزالة حسابك من لوحة التحكم. تواصل مع المالك.";
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) router.replace("/dashboard");
    });
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.replace("/dashboard");
    } catch {
      setError("البريد أو كلمة السر غير صحيحة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl border border-line bg-card p-6"
      >
        <div className="flex items-center gap-3">
          <LogoMark
            className="h-12 w-12"
            src="/assets/logo.jpeg"
            alt="ونس"
            priority
          />
          <div>
            <h1 className="text-xl font-extrabold">ونس</h1>
            <p className="text-sm text-muted">دخول لوحة المتجر</p>
          </div>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">البريد</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input-border bg-input-background px-3 py-3 outline-none focus:border-primary"
            dir="ltr"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">كلمة السر</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input-border bg-input-background px-3 py-3 outline-none focus:border-primary"
            dir="ltr"
          />
        </label>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
