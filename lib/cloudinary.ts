import { v2 as cloudinary } from "cloudinary";

function env(name: string) {
  const value = process.env[name];
  return value && value.length > 0 ? value.trim() : "";
}

function fromUrl() {
  const raw = env("CLOUDINARY_URL").replace(/^['"]|['"]$/g, "");
  if (!raw) return { cloudName: "", apiKey: "", apiSecret: "" };
  const match = raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i);
  if (match) {
    return {
      cloudName: decodeURIComponent(match[3]).replace(/\/+$/, ""),
      apiKey: decodeURIComponent(match[1]),
      apiSecret: decodeURIComponent(match[2]),
    };
  }
  try {
    const parsed = new URL(raw);
    return {
      cloudName: parsed.hostname,
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
    };
  } catch {
    return { cloudName: "", apiKey: "", apiSecret: "" };
  }
}

export function getCloudinaryCredentials() {
  const parsed = fromUrl();
  return {
    cloudName:
      parsed.cloudName ||
      env("CLOUDINARY_CLOUD_NAME") ||
      env("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey:
      parsed.apiKey ||
      env("CLOUDINARY_API_KEY") ||
      env("NEXT_PUBLIC_CLOUDINARY_API_KEY"),
    apiSecret: parsed.apiSecret || env("CLOUDINARY_API_SECRET"),
  };
}

export function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) return false;
  cloudinary.config({
    secure: true,
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  return true;
}

export function cloudinaryReady() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  return Boolean(cloudName && apiKey && apiSecret);
}

export { cloudinary };

export const CLOUDINARY_FOLDER = "wanas";

export function cloudinaryErrorMessage(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  if (/Must supply (api_key|api_secret|cloud_name)/i.test(message)) {
    return "Cloudinary غير مضبوط على السيرفر. راجع متغيرات البيئة.";
  }
  if (/Invalid Signature|Invalid api_key/i.test(message)) {
    return "بيانات Cloudinary غير صحيحة. راجع API Key و Secret.";
  }
  if (/Upload preset/i.test(message)) {
    return "مسار الرفع لا يستخدم upload preset. ارفع من خلال السيرفر فقط.";
  }
  return message || "فشل رفع الصورة";
}
