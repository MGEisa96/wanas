import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { FIREBASE_WEB_CONFIG } from "./firebase-config";
import { getFirebaseDb } from "./firebase";

export const ERROR_LOG_COLLECTION = "errorLogs";
export const ERROR_LOG_RETENTION_DAYS = 14;

export type ErrorSource = "server" | "client" | "api";

export type ErrorLog = {
  id: string;
  message: string;
  stack: string;
  source: ErrorSource;
  path: string;
  status: number;
  digest: string;
  createdAt: Date | null;
};

export type ErrorReport = {
  message: string;
  stack?: string;
  source: ErrorSource;
  path?: string;
  status?: number;
  digest?: string;
};

const recent = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;

function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function sourceOf(value: unknown): ErrorSource {
  if (value === "server" || value === "client" || value === "api") return value;
  return "client";
}

function shouldSkip(message: string, path: string) {
  const text = `${message} ${path}`.toLowerCase();
  if (!message) return true;
  if (path.startsWith("/api/errors")) return true;
  if (text.includes("chrome-extension://")) return true;
  if (message === "Script error.") return true;
  if (message.includes("ResizeObserver loop")) return true;
  return false;
}

function limited() {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += 1;
  return windowCount > 40;
}

function deduped(key: string) {
  const now = Date.now();
  for (const [item, seen] of recent) {
    if (now - seen > 60_000) recent.delete(item);
  }
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
}

function fields(report: ErrorReport) {
  const now = new Date();
  const expires = new Date(
    now.getTime() + ERROR_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  return {
    message: { stringValue: clip(report.message, 700) },
    stack: { stringValue: clip(report.stack, 2400) },
    source: { stringValue: sourceOf(report.source) },
    path: { stringValue: clip(report.path, 350) || "/" },
    status: { integerValue: String(Number(report.status) || 0) },
    digest: { stringValue: clip(report.digest, 100) },
    createdAt: { timestampValue: now.toISOString() },
    expiresAt: { timestampValue: expires.toISOString() },
  };
}

export async function recordError(report: ErrorReport) {
  const message = clip(report.message, 700);
  const path = clip(report.path, 350) || "/";
  if (shouldSkip(message, path) || limited()) return;
  if (deduped(`${report.source}|${path}|${message}|${report.status || 0}`)) return;

  console.error("[wanas-error]", {
    message,
    path,
    source: report.source,
    status: report.status || 0,
  });

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_WEB_CONFIG.projectId}/databases/(default)/documents/${ERROR_LOG_COLLECTION}?key=${FIREBASE_WEB_CONFIG.apiKey}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: fields({ ...report, message, path }) }),
    });
  } catch {
    /* keep the page working even if logging fails */
  }
}

export function subscribeErrorLogs(
  onData: (rows: ErrorLog[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(
    collection(getFirebaseDb(), ERROR_LOG_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(80),
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
            message: String(data.message ?? ""),
            stack: String(data.stack ?? ""),
            source: sourceOf(data.source),
            path: String(data.path ?? ""),
            status: Number(data.status) || 0,
            digest: String(data.digest ?? ""),
            createdAt: createdAt?.toDate?.() ?? null,
          };
        }),
      );
    },
    (error) => onError?.(error),
  );
}

export async function purgeExpiredErrorLogs() {
  const now = Timestamp.now();
  const expired = await getDocs(
    query(
      collection(getFirebaseDb(), ERROR_LOG_COLLECTION),
      where("expiresAt", "<", now),
      limit(40),
    ),
  );
  await Promise.all(expired.docs.map((item) => deleteDoc(item.ref)));
}

export async function deleteErrorLog(id: string) {
  await deleteDoc(doc(getFirebaseDb(), ERROR_LOG_COLLECTION, id));
}
