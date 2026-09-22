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
import { getNote, updateNote } from "../services/noteService";

export default function NoteEditorScreen({ route, navigation }) {
  const { noteId } = route.params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("Saved");
  const draftRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const guard = event => { if (draftRef.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);

  // Load the note data on mount
  useEffect(() => {
    const loadNote = async () => {
      try {
        const data = await getNote(noteId);
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setDateLabel(data.dateLabel || "");
          setTimeLabel(data.timeLabel || "");
        }
      } catch (err) {
        setStatus("Could not load note. Go back and try again.");
      } finally {
        setLoaded(true);
      }
    };
    loadNote();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (draftRef.current) updateNote(noteId, draftRef.current).catch(() => {});
    };
  }, [noteId]);

  // Auto-save with debounce (saves 800ms after you stop typing)
  const debounceSave = useCallback(
    (newTitle, newContent) => {
      draftRef.current = { title: newTitle, content: newContent };
      setStatus("Saving…");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateNote(noteId, { title: newTitle, content: newContent });
          if (draftRef.current?.title === newTitle && draftRef.current?.content === newContent) { draftRef.current = null; setStatus("Saved"); }
        } catch (err) {
          setStatus("Save failed — press Back to retry before leaving.");
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
        <TouchableOpacity onPress={async () => { clearTimeout(saveTimerRef.current); try { if (draftRef.current) { await updateNote(noteId, draftRef.current); draftRef.current = null; } navigation.goBack(); } catch { setStatus("Save failed. Please try again."); } }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.autoSaveLabel}>{status}</Text>
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
          accessibilityLabel="Note title"
          value={title}
          onChangeText={handleTitleChange}
          maxLength={100}
        />

        {/* Content input */}
        <TextInput
          style={styles.contentInput}
          placeholder="Start writing..."
          placeholderTextColor="#444"
          accessibilityLabel="Note content"
          maxLength={100000}
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
    backgroundColor: "#101724",
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
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
    color: "#94a3b8",
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
