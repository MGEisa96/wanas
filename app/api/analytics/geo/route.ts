import { normalizeCountryCode } from "@/lib/geo";

export async function GET(request: Request) {
  const country = normalizeCountryCode(
    request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry"),
  );
  return Response.json({ country });
}
