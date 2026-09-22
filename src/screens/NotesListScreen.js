import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { subscribeToNotes, createNote, deleteNote } from "../services/noteService";
import { logoutUser } from "../services/authService";
import { auth, isDemo } from "../config/firebase";

export default function NotesListScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const unsubscribe = subscribeToNotes(userId, setNotes, () => setError("Unable to load notes. Check connection and configuration."));
    return () => unsubscribe();
  }, []);

  const handleNewNote = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const noteId = await createNote(userId);
      navigation.navigate("Editor", { noteId });
    } catch (err) {
      setError("Could not create note. Your storage may be full.");
    }
  };

  const handleDeleteNote = (noteId) => {
    const doDelete = async () => {
      try {
        await deleteNote(noteId);
      } catch (err) {
        setError("Could not delete note. Please try again.");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Delete this note?")) {
        doDelete();
      }
    } else {
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => navigation.navigate("Editor", { noteId: item.id })}
      onLongPress={() => handleDeleteNote(item.id)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || "Untitled Note"}
        </Text>
        <TouchableOpacity
          accessibilityLabel="Delete note" onPress={(event) => { event.stopPropagation(); handleDeleteNote(item.id); }}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.notePreview} numberOfLines={2}>
        {item.content || "No content yet..."}
      </Text>
      <View style={styles.noteMeta}>
        <Text style={styles.noteDate}>{item.dateLabel}</Text>
        <Text style={styles.noteTime}>{item.timeLabel}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>AutoNote</Text>
        {Platform.OS === "web" && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Export notes" onPress={() => { const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "autonote-backup.json"; link.click(); URL.revokeObjectURL(url); }} style={styles.logoutBtn}><Text style={{ color: "#b9d2ff" }}>Export notes</Text></TouchableOpacity>}
        {!isDemo && <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>}
      </View>

      <Text style={{ color: "#a5b4cc", padding: 20 }}>{isDemo ? "Your private notebook · Saved only on this device" : "Your thoughts, synced and timestamped"}</Text>
      {error ? <Text accessibilityRole="alert" style={{ color: "#ff9999", padding: 16 }}>{error}</Text> : null}
      <TextInput accessibilityLabel="Search notes" placeholder="Search your notes" placeholderTextColor="#94a3b8" value={search} onChangeText={setSearch} style={{ color: "white", padding: 16, marginHorizontal: 16, backgroundColor: "#1a2233", borderRadius: 12 }} />
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to start writing
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes.filter(n => `${n.title} ${n.content}`.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Create note" style={styles.fab} onPress={handleNewNote}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 55,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  logoutText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 10,
  },
  deleteBtnText: {
    color: "#666",
    fontSize: 16,
  },
  notePreview: {
    fontSize: 14,
    color: "#999",
    marginBottom: 10,
    lineHeight: 20,
  },
  noteMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteDate: {
    fontSize: 12,
    color: "#4f8ef7",
    fontWeight: "500",
  },
  noteTime: {
    fontSize: 12,
    color: "#666",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4f8ef7",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#4f8ef7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
  },
});
