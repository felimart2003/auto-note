import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ============================================================
// 🔥 REPLACE THESE WITH YOUR OWN FIREBASE CONFIG
// Go to https://console.firebase.google.com
// 1. Create a new project (or use existing)
// 2. Add a Web app
// 3. Copy the config object and paste it below
// 4. Enable Authentication > Email/Password in Firebase Console
// 5. Create a Firestore Database in Firebase Console
// ============================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

// Use AsyncStorage persistence on native, default on web
let auth;
if (Platform.OS === "web") {
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);

export { auth, db };
