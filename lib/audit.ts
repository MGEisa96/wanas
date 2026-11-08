import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";

export const AUDIT_COLLECTION = "auditLogs";
export const AUDIT_SETTINGS_PATH = ["config", "auditSettings"] as const;
export const DEFAULT_AUDIT_RETENTION_DAYS = 7;
export const MIN_AUDIT_RETENTION_DAYS = 1;
export const MAX_AUDIT_RETENTION_DAYS = 365;

export type AuditAction =
  | "content.save"
  | "admin.create"
  | "admin.remove"
  | "admin.password"
  | "application.delete";

export type AuditLog = {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: AuditAction;
  summary: string;
  details: string[];
  createdAt: Date | null;
};

function parseAuditAction(value: unknown): AuditAction {
  if (
    value === "admin.create" ||
    value === "admin.remove" ||
    value === "admin.password" ||
    value === "application.delete" ||
    value === "content.save"
  ) {
    return value;
  }
  return "content.save";
}

export function clampAuditRetentionDays(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_AUDIT_RETENTION_DAYS;
  return Math.min(
    MAX_AUDIT_RETENTION_DAYS,
    Math.max(MIN_AUDIT_RETENTION_DAYS, Math.round(value)),
  );
}

function auditSettingsRef() {
  const [col, id] = AUDIT_SETTINGS_PATH;
  return doc(getFirebaseDb(), col, id);
}

export async function saveAuditRetentionDays(days: number) {
  const retentionDays = clampAuditRetentionDays(days);
  await setDoc(
    auditSettingsRef(),
    { retentionDays },
    { merge: true },
  );
  return retentionDays;
}

export function subscribeAuditRetentionDays(
  onData: (days: number) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    auditSettingsRef(),
    (snap) => {
      const days = Number(snap.data()?.retentionDays);
      onData(clampAuditRetentionDays(days || DEFAULT_AUDIT_RETENTION_DAYS));
    },
    (error) => onError?.(error),
  );
}

export async function writeAuditLog(input: {
  action: AuditAction;
  summary: string;
  details?: string[];
}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) return;
  const retention = await getDoc(auditSettingsRef());
  const days = clampAuditRetentionDays(
    Number(retention.data()?.retentionDays) || DEFAULT_AUDIT_RETENTION_DAYS,
  );
  const expiresAt = Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);
  await addDoc(collection(getFirebaseDb(), AUDIT_COLLECTION), {
    actorUid: user.uid,
    actorEmail: user.email || "",
    action: input.action,
    summary: input.summary,
    details: input.details || [],
    createdAt: serverTimestamp(),
    expiresAt,
  });
}

export function subscribeAuditLogs(
  onData: (rows: AuditLog[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(
    collection(getFirebaseDb(), AUDIT_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(100),
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => {
          const data = item.data();
          const createdAt = data.createdAt as Timestamp | undefined;
          return {
            id: item.id,
            actorUid: String(data.actorUid || ""),
            actorEmail: String(data.actorEmail || ""),
            action: parseAuditAction(data.action),
            summary: String(data.summary || ""),
            details: Array.isArray(data.details)
              ? data.details.map(String)
              : [],
            createdAt: createdAt?.toDate?.() ?? null,
          };
        }),
      );
    },
    (error) => onError?.(error),
  );
}

export async function purgeExpiredAuditLogs() {
  const q = query(
    collection(getFirebaseDb(), AUDIT_COLLECTION),
    where("expiresAt", "<", Timestamp.now()),
    limit(50),
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((item) => deleteDoc(item.ref)));
}
