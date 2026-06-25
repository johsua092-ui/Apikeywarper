import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function parseServiceAccount(): string {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env missing");
  return raw;
}

const apps = getApps();
const adminApp =
  apps.length === 0
    ? initializeApp({ credential: cert(JSON.parse(parseServiceAccount())) })
    : apps[0];

export const adminDb = getFirestore(adminApp);
export { adminApp };
