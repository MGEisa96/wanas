function env(name: string, fallback = "") {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

/** Wired to Firebase project wanas-47c35. Prefer `.env.local` overrides. */
export const FIREBASE_WEB_CONFIG = {
  apiKey: env(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "AIzaSyDjYVqd1GukcClIaZijDsp_WI-c6Duq8Cg",
  ),
  authDomain: env(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "wanas-47c35.firebaseapp.com",
  ),
  projectId: env("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "wanas-47c35"),
  storageBucket: env(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "wanas-47c35.firebasestorage.app",
  ),
  messagingSenderId: env(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "796505639383",
  ),
  appId: env(
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "1:796505639383:web:dcda9804a8146a8e962392",
  ),
  measurementId: env(
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "G-2HH3HHSMJD",
  ),
};
