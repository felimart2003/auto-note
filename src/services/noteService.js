import {
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isDemo } from "../config/firebase";

import AsyncStorage from "@react-native-async-storage/async-storage";
const listeners = new Set();
let queue = Promise.resolve();
const readLocal = async () => {
  const raw = await AsyncStorage.getItem("autonote.notes.v1");
  const notes = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(notes)) throw new Error("Stored notes are invalid. Export or clear browser storage to recover.");
  return notes;
};
const mutateLocal = (change) => {
  const task = queue.then(async () => {
    const notes = change(await readLocal());
    await AsyncStorage.setItem("autonote.notes.v1", JSON.stringify(notes));
    listeners.forEach(fn => fn([...notes].reverse()));
  });
  queue = task.catch(() => {});
  return task;
};
export const getNote = async (id) => {
  if (isDemo) return (await readLocal()).find(n => n.id === id);
  const snapshot = await getDoc(doc(db, "notes", id));
  return snapshot.exists() ? snapshot.data() : null;
};
const NOTES_COLLECTION = "notes";

/**
 * Create a new note — automatically captures the date/time
 */
export const createNote = async (userId) => {
  const now = new Date();
  if (isDemo) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await mutateLocal(notes => [...notes, { id, userId, title: "", content: "", createdAt: now.getTime(), dateLabel: now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }), timeLabel: now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) }]);
    return id;
  }
  const noteRef = await addDoc(collection(db, NOTES_COLLECTION), {
    userId,
    title: "",
    content: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dateLabel: now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    timeLabel: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  return noteRef.id;
};

/**
 * Update a note's title or content
 */
export const updateNote = async (noteId, data) => {
  if (isDemo) return mutateLocal(notes => notes.map(n => n.id === noteId ? { ...n, ...data, updatedAt: Date.now() } : n));
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(noteRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId) => {
  if (isDemo) return mutateLocal(notes => notes.filter(n => n.id !== noteId));
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(noteRef);
};

/**
 * Subscribe to real-time notes for a user, sorted newest first
 */
export const subscribeToNotes = (userId, callback, onError = () => {}) => {
  if (isDemo) { listeners.add(callback); readLocal().then(notes => callback(notes.reverse())).catch(onError); return () => listeners.delete(callback); }
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notes);
  }, onError);
};
