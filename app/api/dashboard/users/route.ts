import {
  requireDashboardOwner,
  requireDashboardStaff,
} from "@/lib/auth-server";
import { FIREBASE_WEB_CONFIG } from "@/lib/firebase-config";
import { isOwnerEmail } from "@/lib/owner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const actor = await requireDashboardStaff(request);
  if (!actor) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = FIREBASE_WEB_CONFIG.apiKey;
  if (!apiKey) {
    return Response.json({ error: "Firebase is not configured" }, { status: 500 });
  }

  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (isOwnerEmail(email)) {
    return Response.json(
      { error: "البريد ده خاص بالمالك ومينفعش يتسجل كمشرف" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "البريد غير صحيح" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json(
      { error: "كلمة السر لازم 8 حروف على الأقل" },
      { status: 400 },
    );
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );
  const data = (await res.json()) as {
    localId?: string;
    email?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.localId) {
    return Response.json(
      { error: firebaseError(data.error?.message) },
      { status: data.error?.message === "EMAIL_EXISTS" ? 409 : 400 },
    );
  }

  const createdEmail = (data.email ?? email).toLowerCase();
  const createdBy = (actor.email ?? actor.localId).toLowerCase();
  const saved = await createAdminDocument(actor.token, {
    uid: data.localId,
    email: createdEmail,
    createdBy,
  });
  if (!saved) {
    return Response.json(
      {
        error:
          "الحساب اتعمل في Firebase لكن تسجيله في القائمة فشل. حاول تاني أو شيله من Authentication.",
      },
      { status: 500 },
    );
  }

  return Response.json({
    uid: data.localId,
    email: createdEmail,
    createdBy,
  });
}

export async function DELETE(request: Request) {
  const actor = await requireDashboardOwner(request);
  if (!actor) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { uid?: string };
  const uid = body.uid?.trim() ?? "";
  if (!uid) {
    return Response.json({ error: "Missing uid" }, { status: 400 });
  }
  if (uid === actor.localId) {
    return Response.json({ error: "مينفعش تشيل حسابك" }, { status: 400 });
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "wanas";
  const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admins/${uid}`;
  const snap = await fetch(docUrl, {
    headers: { Authorization: `Bearer ${actor.token}` },
  });
  if (!snap.ok) {
    return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const doc = (await snap.json()) as {
    fields?: { email?: { stringValue?: string } };
  };
  const email = doc.fields?.email?.stringValue ?? "";
  if (isOwnerEmail(email)) {
    return Response.json({ error: "مينفعش تشيل حساب المالك" }, { status: 400 });
  }

  const del = await fetch(docUrl, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${actor.token}` },
  });
  if (!del.ok) {
    return Response.json({ error: "فشل حذف المستخدم" }, { status: 400 });
  }

  return Response.json({ uid, email });
}

function projectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "wanas";
}

async function createAdminDocument(
  token: string,
  input: { uid: string; email: string; createdBy: string },
) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents/admins?documentId=${input.uid}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          email: { stringValue: input.email },
          role: { stringValue: "admin" },
          createdBy: { stringValue: input.createdBy },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      }),
    },
  );
  return res.ok;
}

function firebaseError(code?: string) {
  switch (code) {
    case "EMAIL_EXISTS":
      return "البريد مسجّل قبل كده";
    case "WEAK_PASSWORD":
      return "كلمة السر ضعيفة";
    case "INVALID_EMAIL":
      return "البريد غير صحيح";
    case "OPERATION_NOT_ALLOWED":
      return "تسجيل البريد غير مفعّل في Firebase";
    default:
      return "فشل إنشاء المستخدم";
  }
}
