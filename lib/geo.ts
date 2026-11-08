const UNKNOWN = "XX";

export function normalizeCountryCode(value?: string | null) {
  const code = (value ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && code !== "T1") return code;
  return UNKNOWN;
}

export function countryLabel(code: string, locale = "ar") {
  if (code === UNKNOWN) return locale === "ar" ? "غير معروف" : "Unknown";
  try {
    return new Intl.DisplayNames([locale, "en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryFlag(code: string) {
  if (code === UNKNOWN || !/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0)),
  );
}

export async function detectVisitorCountry() {
  try {
    const res = await fetch("/api/analytics/geo");
    if (res.ok) {
      const data = (await res.json()) as { country?: string };
      const code = normalizeCountryCode(data.country);
      if (code !== UNKNOWN) return code;
    }
  } catch {
    // Fall through to public IP lookup (local / missing CDN headers).
  }

  try {
    const res = await fetch("https://ipwho.is/?fields=country_code,success");
    if (res.ok) {
      const data = (await res.json()) as {
        success?: boolean;
        country_code?: string;
      };
      if (data.success !== false) return normalizeCountryCode(data.country_code);
    }
  } catch {
    // Ignore blocked lookups.
  }

  return UNKNOWN;
}
