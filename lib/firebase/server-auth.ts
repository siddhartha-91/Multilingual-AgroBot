// lib/firebase/server-auth.ts
// Server-side Firebase Admin initialization for verifying ID tokens (middleware, protected APIs)

import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp;

// Initialize Admin SDK only once
if (!getApps().length) {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!base64) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in .env.local");
  }

  const jsonStr = Buffer.from(base64, "base64").toString("utf8");
  const serviceAccount = JSON.parse(jsonStr);

  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
