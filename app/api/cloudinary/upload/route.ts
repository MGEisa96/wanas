import { requireDashboardStaff } from "@/lib/auth-server";
import {
  cloudinary,
  CLOUDINARY_FOLDER,
  cloudinaryErrorMessage,
  configureCloudinary,
} from "@/lib/cloudinary";
import { recordError } from "@/lib/error-log";

const MAX_BYTES = 8 * 1024 * 1024;

function fileKind(file: File) {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (type === "image/svg+xml" || name.endsWith(".svg")) return "svg";
  if (type === "image/gif" || name.endsWith(".gif")) return "gif";
  if (
    type === "image/png" ||
    name.endsWith(".png") ||
    type === "image/jpeg" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    type === "image/webp" ||
    name.endsWith(".webp")
  ) {
    return "image";
  }
  return "";
}

export async function POST(request: Request) {
  const user = await requireDashboardStaff(request);
  if (!user) {
    return Response.json(
      { error: "غير مصرح. سجّل الدخول مرة أخرى من الدومين الحالي." },
      { status: 401 },
    );
  }

  if (!configureCloudinary()) {
    const error =
      "Cloudinary غير مضبوط على السيرفر. أضف CLOUDINARY_URL و CLOUDINARY_API_SECRET على بيئة الإنتاج ثم أعد النشر.";
    void recordError({
      message: error,
      source: "api",
      path: "/api/cloudinary/upload",
      status: 500,
    });
    return Response.json({ error }, { status: 500 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "الصورة أكبر من 8 ميجا" }, { status: 400 });
  }
  const kind = fileKind(file);
  if (!kind) {
    return Response.json(
      { error: "الصيغة المسموحة: PNG, GIF, SVG, JPG, WEBP" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime =
      file.type ||
      (kind === "svg" ? "image/svg+xml" : kind === "gif" ? "image/gif" : "image/png");
    const uploaded = await cloudinary.uploader.upload(
      `data:${mime};base64,${buffer.toString("base64")}`,
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        ...(kind === "svg" ? { format: "svg" } : {}),
      },
    );
    if (!uploaded.secure_url) {
      return Response.json({ error: "فشل رفع الصورة" }, { status: 502 });
    }
    return Response.json({ url: uploaded.secure_url });
  } catch (error) {
    const message = cloudinaryErrorMessage(error);
    void recordError({
      message,
      stack: error instanceof Error ? error.stack : undefined,
      source: "api",
      path: "/api/cloudinary/upload",
      status: 400,
    });
    return Response.json({ error: message }, { status: 400 });
  }
}
