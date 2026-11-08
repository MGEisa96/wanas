import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseAuth, getFirebaseStorage } from "./firebase";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "image";
}

/** Upload product/media images via Firebase Storage (works without Cloudinary). */
export async function uploadImageToFirebaseStorage(file: File): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("سجل الدخول أولاً");

  try {
    const path = `wanas/uploads/${user.uid}/${Date.now()}-${safeName(file.name)}`;
    const storageRef = ref(getFirebaseStorage(), path);
    const snap = await uploadBytes(storageRef, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "public,max-age=31536000",
    });
    return getDownloadURL(snap.ref);
  } catch (cause) {
    const raw = cause instanceof Error ? cause.message : String(cause);
    if (/storage\/|bucket|404|not.?found|unauthorized|permission/i.test(raw)) {
      throw new Error(
        "رفع الملفات غير مفعّل بعد. الصقي رابط صورة (Unsplash أو أي URL) في الحقل بالأسفل.",
      );
    }
    throw cause instanceof Error ? cause : new Error("فشل رفع الصورة");
  }
}
