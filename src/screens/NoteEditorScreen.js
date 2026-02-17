import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { updateNote } from "../services/noteService";

export default function NoteEditorScreen({ route, navigation }) {
  const { noteId } = route.params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef(null);

  // Load the note data on mount
  useEffect(() => {
    const loadNote = async () => {
      try {
        const noteDoc = await getDoc(doc(db, "notes", noteId));
        if (noteDoc.exists()) {
          const data = noteDoc.data();
          setTitle(data.title || "");
          setContent(data.content || "");
          setDateLabel(data.dateLabel || "");
          setTimeLabel(data.timeLabel || "");
        }
      } catch (err) {
        console.error("Failed to load note:", err);
      } finally {
        setLoaded(true);
      }
    };
    loadNote();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [noteId]);

  // Auto-save with debounce (saves 800ms after you stop typing)
  const debounceSave = useCallback(
    (newTitle, newContent) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateNote(noteId, { title: newTitle, content: newContent });
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }, 800);
    },
    [noteId]
  );

  const handleTitleChange = (text) => {
    setTitle(text);
    debounceSave(text, content);
  };

  const handleContentChange = (text) => {
    setContent(text);
    debounceSave(title, text);
  };

  if (!loaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.autoSaveLabel}>Auto-saving</Text>
        </View>
      </View>

      <ScrollView style={styles.editorScroll} keyboardDismissMode="interactive">
        {/* Auto-generated date/time stamp */}
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <Text style={styles.timeText}>{timeLabel}</Text>
        </View>

        {/* Title input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Note title..."
          placeholderTextColor="#555"
          value={title}
          onChangeText={handleTitleChange}
          maxLength={100}
        />

        {/* Content input */}
        <TextInput
          style={styles.contentInput}
          placeholder="Start writing..."
          placeholderTextColor="#444"
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 55,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backText: {
    color: "#4f8ef7",
    fontSize: 16,
    fontWeight: "600",
  },
  headerMeta: {
    alignItems: "flex-end",
  },
  autoSaveLabel: {
    fontSize: 12,
    color: "#555",
    fontStyle: "italic",
  },
  editorScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateBlock: {
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f8ef7",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    color: "#666",
  },
  titleInput: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    color: "#ddd",
    lineHeight: 26,
    minHeight: 300,
    padding: 0,
  },
});
