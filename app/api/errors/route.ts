import { recordError, type ErrorSource } from "@/lib/error-log";

export async function POST(request: Request) {
  let body: {
    message?: string;
    stack?: string;
    source?: ErrorSource;
    path?: string;
    status?: number;
    digest?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) {
    return Response.json({ error: "Missing message" }, { status: 400 });
  }

  await recordError({
    message,
    stack: body.stack,
    source: body.source === "server" || body.source === "api" ? body.source : "client",
    path: body.path,
    status: body.status,
    digest: body.digest,
  });

  return Response.json({ ok: true });
}
