import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("all fields required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("username", res.data.username);
      router.replace("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>▣</Text>
          </View>
          <Text style={s.logoText}>storeroom</Text>
        </View>
        <Text style={s.subtitle}>sign in to your vault</Text>
        <View style={s.form}>
          <TextInput
            style={s.input}
            placeholder="username"
            placeholderTextColor="#444"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder="password"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <TouchableOpacity
            style={s.btn}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={s.btnText}>
              {loading ? "signing in..." : "sign in →"}
            </Text>
          </TouchableOpacity>
          <View style={s.links}>
            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
              <Text style={s.link}>forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={s.link}>create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080909",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.09)",
    backgroundColor: "#0e1011",
  },
  logoBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: { color: "#888", fontSize: 10 },
  logoText: {
    color: "#f0f0f0",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "monospace",
  },
  subtitle: {
    color: "#666",
    fontSize: 11,
    fontFamily: "monospace",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#080909",
  },
  form: { padding: 16, backgroundColor: "#080909", gap: 8 },
  input: {
    backgroundColor: "#0e1011",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 4,
    padding: 12,
    color: "#f0f0f0",
    fontSize: 13,
    fontFamily: "monospace",
  },
  error: {
    color: "#ef4444",
    fontSize: 11,
    fontFamily: "monospace",
    backgroundColor: "rgba(239,68,68,0.06)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
    borderRadius: 4,
    padding: 8,
  },
  btn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#080909",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  link: { color: "#555", fontSize: 11, fontFamily: "monospace" },
});
