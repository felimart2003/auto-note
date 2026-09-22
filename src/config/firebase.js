import { initializeApp } from "firebase/app";
import { createAuth } from "./nativeAuth";
import { getFirestore } from "firebase/firestore";
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const isDemo = !Object.values(config).every(Boolean);
const app = isDemo ? null : initializeApp(config);
export const auth = app ? createAuth(app) : { currentUser: { uid: "local-demo" } };
export const db = app ? getFirestore(app) : null;
