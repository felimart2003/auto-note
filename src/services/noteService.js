import {
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
import { db } from "../config/firebase";

const NOTES_COLLECTION = "notes";

/**
 * Create a new note — automatically captures the date/time
 */
export const createNote = async (userId) => {
  const now = new Date();
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
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(noteRef);
};

/**
 * Subscribe to real-time notes for a user, sorted newest first
 */
export const subscribeToNotes = (userId, callback) => {
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
  });
};
