import { FIREBASE_WEB_CONFIG } from "./firebase-config";
import { isOwnerEmail, OWNER_EMAIL } from "./owner";

export { OWNER_EMAIL, isOwnerEmail };

export type AuthUser = {
  localId: string;
  email?: string;
  token: string;
};

export async function requireFirebaseUser(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const apiKey = FIREBASE_WEB_CONFIG.apiKey;
  if (!token || !apiKey) return null;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    users?: Array<{ localId: string; email?: string }>;
  };
  const user = data.users?.[0];
  if (!user) return null;
  return { ...user, token };
}

export async function requireDashboardStaff(request: Request) {
  const user = await requireFirebaseUser(request);
  if (!user) return null;
  if (isOwnerEmail(user.email)) return user;

  const projectId = FIREBASE_WEB_CONFIG.projectId;
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${user.localId}?key=${FIREBASE_WEB_CONFIG.apiKey}`,
    { headers: { Authorization: `Bearer ${user.token}` } },
  );
  if (!res.ok) return null;
  return user;
}

export async function requireDashboardOwner(request: Request) {
  const user = await requireDashboardStaff(request);
  if (!user || !isOwnerEmail(user.email)) return null;
  return user;
}
