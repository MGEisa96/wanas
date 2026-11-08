import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { isOwnerEmail } from "./owner";

export type AdminRole = "owner" | "admin";

export type DashboardAdmin = {
  uid: string;
  email: string;
  role: AdminRole;
  createdBy: string;
  createdAt: Date | null;
  lastSeenAt: Date | null;
};

export function roleOfEmail(email: string): AdminRole {
  return isOwnerEmail(email) ? "owner" : "admin";
}

export function roleLabel(role: AdminRole) {
  return role === "owner" ? "مالك" : "مشرف";
}

export function roleDescription(role: AdminRole) {
  return role === "owner"
    ? "السجل، حذف المستخدمين، إعدادات الاحتفاظ، وكل صلاحيات المشرف"
    : "تعديل الموقع، الإحصائيات، رفع الصور، وإضافة مستخدمين";
}

export async function touchCurrentAdmin(uid: string, email: string) {
  const ref = doc(getFirebaseDb(), "admins", uid);
  const role = roleOfEmail(email);

  if (role === "owner") {
    await setDoc(
      ref,
      {
        email: email.trim().toLowerCase(),
        role,
        createdBy: email.trim().toLowerCase(),
        lastSeenAt: serverTimestamp(),
      },
      { merge: true },
    );
    return "ok" as const;
  }

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return "removed" as const;
  } catch {
    return "removed" as const;
  }

  await setDoc(
    ref,
    {
      email: email.trim().toLowerCase(),
      role: "admin",
      lastSeenAt: serverTimestamp(),
    },
    { merge: true },
  );
  return "ok" as const;
}

export function subscribeAdminPresence(
  uid: string,
  onExists: (exists: boolean) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    doc(getFirebaseDb(), "admins", uid),
    (snap) => onExists(snap.exists()),
    (error) => onError?.(error),
  );
}

export function subscribeAdmins(
  onData: (rows: DashboardAdmin[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    collection(getFirebaseDb(), "admins"),
    (snap) => {
      const rows = snap.docs
        .map((item) => {
          const data = item.data();
          const createdAt = data.createdAt as Timestamp | undefined;
          const lastSeenAt = data.lastSeenAt as Timestamp | undefined;
          const email = String(data.email ?? "");
          return {
            uid: item.id,
            email,
            role: roleOfEmail(email),
            createdBy: String(data.createdBy ?? ""),
            createdAt: createdAt?.toDate?.() ?? null,
            lastSeenAt: lastSeenAt?.toDate?.() ?? null,
          };
        })
        .sort((a, b) => {
          if (a.role !== b.role) return a.role === "owner" ? -1 : 1;
          return a.email.localeCompare(b.email);
        });
      onData(rows);
    },
    (error) => onError?.(error),
  );
}
