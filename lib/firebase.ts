import { getAuth, type Auth } from "firebase/auth";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { FIREBASE_WEB_CONFIG } from "./firebase-config";

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(FIREBASE_WEB_CONFIG);
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
