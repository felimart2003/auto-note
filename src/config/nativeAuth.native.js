import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const createAuth = app => initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
