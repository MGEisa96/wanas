"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { writeAuditLog } from "@/lib/audit";
import { getFirebaseAuth } from "@/lib/firebase";
import { isOwnerEmail } from "@/lib/owner";
import {
  roleDescription,
  roleLabel,
  subscribeAdmins,
  type DashboardAdmin,
} from "@/lib/admins";
import { Card } from "./fields";

export function UsersTab({
  currentEmail,
  currentUid,
}: {
  currentEmail: string;
  currentUid: string;
}) {
  const isOwner = isOwnerEmail(currentEmail);
  const [rows, setRows] = useState<DashboardAdmin[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAdmins(setRows, (cause) => setError(cause.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (password !== confirm) {
      setError("كلمتا السر غير متطابقتين");
      return;
    }
    if (isOwnerEmail(email)) {
      setError("البريد ده خاص بالمالك ومينفعش يتسجل كمشرف");
      return;
    }
    if (rows.some((row) => row.email === email.trim().toLowerCase())) {
      setError("المستخدم موجود بالفعل");
      return;
    }

    setSaving(true);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken();
      if (!token) throw new Error("سجل الدخول أولاً");

      const res = await fetch("/api/dashboard/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as {
        uid?: string;
        email?: string;
        createdBy?: string;
        error?: string;
      };
      if (!res.ok || !data.uid || !data.email) {
        throw new Error(data.error || "فشل إنشاء المستخدم");
      }

      await writeAuditLog({
        action: "admin.create",
        summary: "إنشاء مستخدم للوحة التحكم",
        details: [`مشرف · ${data.email}`],
      }).catch(() => undefined);
      setEmail("");
      setPassword("");
      setConfirm("");
      setStatus(`تم إنشاء ${data.email} بدور مشرف. يقدر يدخل من صفحة تسجيل الدخول.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "فشل إنشاء المستخدم");
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(row: DashboardAdmin) {
    setError("");
    setStatus("");
    setRemovingUid(row.uid);
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken();
      if (!token) throw new Error("سجل الدخول أولاً");

      const res = await fetch("/api/dashboard/users", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: row.uid }),
      });
      const data = (await res.json()) as { email?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "فشل حذف المستخدم");

      await writeAuditLog({
        action: "admin.remove",
        summary: "إزالة مستخدم من لوحة التحكم",
        details: [data.email || row.email],
      }).catch(() => undefined);
      setPendingUid(null);
      setStatus(`تم إزالة ${data.email || row.email} من لوحة التحكم.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "فشل حذف المستخدم");
    } finally {
      setRemovingUid(null);
    }
  }

  return (
    <div className="space-y-5">
      <ChangePasswordCard />
      <div className="grid gap-3 sm:grid-cols-2">
        <RoleCard role="owner" count={rows.filter((row) => row.role === "owner").length} />
        <RoleCard role="admin" count={rows.filter((row) => row.role === "admin").length} />
      </div>

      <Card title="إضافة مشرف">
        <p className="text-sm text-muted">
          المشرف الجديد هيقدر يعدّل الموقع ويرفع الصور ويشوف الإحصائيات ويضيف مشرفين تانيين. السجل وحذف المستخدمين للمالك فقط.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">البريد</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">كلمة السر</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">تأكيد كلمة السر</span>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          {status ? <p className="text-sm text-primary">{status}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "جاري الإنشاء..." : "إنشاء مشرف"}
          </button>
        </form>
      </Card>

      <Card title="المستخدمون">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            لسه مفيش قائمة. بعد أول تسجيل دخول أو إنشاء مستخدم، الأسماء هتظهر هنا.
          </p>
        ) : (
          <>
            {!isOwner ? (
              <p className="mb-3 text-sm text-muted">
                إزالة المستخدمين من اللوحة للمالك فقط.
              </p>
            ) : null}
          <ul className="grid gap-3">
            {rows.map((row) => {
              const isYou =
                row.uid === currentUid ||
                row.email.toLowerCase() === currentEmail.toLowerCase();
              const canRemove =
                isOwner && row.role !== "owner" && !isYou && row.uid !== currentUid;
              const confirming = pendingUid === row.uid;
              return (
                <li
                  key={row.uid}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                        row.role === "owner"
                          ? "bg-primary text-white"
                          : "bg-card text-foreground"
                      }`}
                    >
                      {initials(row.email)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{row.email || row.uid}</p>
                        <RoleBadge role={row.role} />
                        {isYou ? (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                            أنت
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {roleDescription(row.role)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {row.createdBy ? `أنشأه ${row.createdBy}` : "الحساب الأساسي"}
                        {" · "}
                        {row.lastSeenAt
                          ? `آخر ظهور ${formatWhen(row.lastSeenAt)}`
                          : row.createdAt
                            ? `أُضيف ${formatWhen(row.createdAt)}`
                            : "لم يسجّل دخول بعد"}
                      </p>
                    </div>
                  </div>
                  {canRemove ? (
                    confirming ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={removingUid === row.uid}
                          onClick={() => removeUser(row)}
                          className="rounded-full bg-error px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {removingUid === row.uid ? "جاري الإزالة..." : "تأكيد الإزالة"}
                        </button>
                        <button
                          type="button"
                          disabled={removingUid === row.uid}
                          onClick={() => setPendingUid(null)}
                          className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingUid(row.uid)}
                        className="rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10"
                      >
                        إزالة من اللوحة
                      </button>
                    )
                  ) : null}
                </li>
              );
            })}
          </ul>
          </>
        )}
      </Card>
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (next.length < 8) {
      setError("كلمة السر الجديدة لازم 8 حروف على الأقل");
      return;
    }
    if (next !== confirm) {
      setError("كلمتا السر الجديدتين غير متطابقتين");
      return;
    }
    if (next === current) {
      setError("اختار كلمة سر جديدة مختلفة عن الحالية");
      return;
    }

    setSaving(true);
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user?.email) throw new Error("سجل الدخول أولاً");
      const cred = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, next);
      await writeAuditLog({
        action: "admin.password",
        summary: "تغيير كلمة سر لوحة التحكم",
      }).catch(() => undefined);
      setCurrent("");
      setNext("");
      setConfirm("");
      setStatus("تم تغيير كلمة السر. استخدم الجديدة في الدخول الجاي.");
    } catch (cause) {
      setError(passwordError(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="تغيير كلمة السر">
      <p className="text-sm text-muted">
        أي مشرف يقدر يغيّر كلمة سر حسابه. لازم تدخل الكلمة الحالية أولاً.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">كلمة السر الحالية</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">كلمة السر الجديدة</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">تأكيد الكلمة الجديدة</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-input-border bg-input-background px-3 py-2.5 text-base outline-none focus:border-primary"
          />
        </label>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {status ? <p className="text-sm text-primary">{status}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "تغيير كلمة السر"}
        </button>
      </form>
    </Card>
  );
}

function passwordError(cause: unknown) {
  const code =
    typeof cause === "object" && cause && "code" in cause
      ? String((cause as { code: string }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/invalid-login-credentials":
      return "كلمة السر الحالية غير صحيحة";
    case "auth/weak-password":
      return "كلمة السر الجديدة ضعيفة";
    case "auth/too-many-requests":
      return "محاولات كتير. استنى شوية وجرب تاني";
    default:
      return cause instanceof Error ? cause.message : "فشل تغيير كلمة السر";
  }
}

function RoleCard({ role, count }: { role: DashboardAdmin["role"]; count: number }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <RoleBadge role={role} />
        <p className="text-2xl font-extrabold tabular-nums">{count}</p>
      </div>
      <p className="mt-2 text-sm text-muted">{roleDescription(role)}</p>
    </article>
  );
}

function RoleBadge({ role }: { role: DashboardAdmin["role"] }) {
  const owner = role === "owner";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        owner ? "bg-primary text-white" : "border border-line text-foreground"
      }`}
    >
      {roleLabel(role)}
    </span>
  );
}

function initials(email: string) {
  const local = email.split("@")[0] ?? "";
  return (local.slice(0, 1) || "?").toUpperCase();
}

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
