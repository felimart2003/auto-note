import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, isDemo } from "../config/firebase";

export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return isDemo ? Promise.resolve() : signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  if (isDemo) { callback(auth.currentUser); return () => {}; }
  return onAuthStateChanged(auth, callback);
};
