import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { loginUser, registerUser } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email.trim(), password);
      } else {
        await registerUser(email.trim(), password);
      }
    } catch (err) {
      const msg = err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
        ? "Invalid email or password."
        : err.code === "auth/email-already-in-use"
        ? "Email already in use."
        : err.code === "auth/weak-password"
        ? "Password should be at least 6 characters."
        : err.code === "auth/invalid-email"
        ? "Invalid email address."
        : "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.appName}>AutoNote</Text>
        <Text style={styles.tagline}>Your thoughts, timestamped automatically</Text>

        <Text style={styles.heading}>{isLogin ? "Welcome back" : "Create account"}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? "Sign In" : "Sign Up"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(""); }}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
  },
  error: {
    color: "#ff6b6b",
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#4f8ef7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  switchText: {
    color: "#4f8ef7",
    textAlign: "center",
    fontSize: 15,
  },
});
