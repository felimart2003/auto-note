import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotesListScreen from "../screens/NotesListScreen";
import NoteEditorScreen from "../screens/NoteEditorScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f0f0f" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="Editor" component={NoteEditorScreen} />
    </Stack.Navigator>
  );
}
