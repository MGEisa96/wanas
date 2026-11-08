/** Egypt mobile helpers — store/display as local `01xxxxxxxxx`. */

const EG_MOBILE = /^01[0125]\d{8}$/;

export function digitsOnly(value: string) {
  return value.replace(/\D+/g, "");
}

/** Normalize user input to local `01xxxxxxxxx` or "" if empty. */
export function normalizeEgyptMobile(raw: string): string {
  let digits = digitsOnly(raw);
  if (!digits) return "";

  // +20 / 20 / 0020 → drop country code
  if (digits.startsWith("0020")) digits = digits.slice(4);
  else if (digits.startsWith("20") && digits.length >= 11) digits = digits.slice(2);

  // National without leading 0: 1xxxxxxxxx
  if (digits.length === 10 && digits.startsWith("1")) {
    digits = `0${digits}`;
  }

  // Truncate accidental extra digits
  if (digits.length > 11) digits = digits.slice(0, 11);

  return digits;
}

export function isValidEgyptMobile(raw: string): boolean {
  return EG_MOBILE.test(normalizeEgyptMobile(raw));
}

/** Digits shown in the field after the +20 prefix (without leading 0). */
export function egyptNationalInput(localPhone: string): string {
  const normalized = normalizeEgyptMobile(localPhone);
  if (!normalized) return "";
  if (normalized.startsWith("0")) return normalized.slice(1);
  return normalized;
}

/** Build local phone from national input typed after +20. */
export function egyptLocalFromNational(national: string): string {
  const digits = digitsOnly(national).slice(0, 10);
  if (!digits) return "";
  if (digits.startsWith("0")) return normalizeEgyptMobile(digits);
  return normalizeEgyptMobile(`0${digits}`);
}

export function egyptPhoneHint(lang: "ar" | "en") {
  return lang === "ar"
    ? "رقم مصري صحيح: 10 / 11 / 12 / 15 ثم 8 أرقام"
    : "Egyptian mobile: 10 / 11 / 12 / 15 + 8 digits";
}

/** Display like `+20 106 138 1439` (LTR). Falls back to raw if invalid. */
export function formatEgyptPhoneDisplay(raw: string): string {
  const local = normalizeEgyptMobile(raw);
  if (!isValidEgyptMobile(local)) return raw.trim() || raw;
  const n = local.slice(1);
  return `+20 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}
