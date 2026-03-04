import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirm) {
      setError("all fields required");
      return;
    }
    if (password !== confirm) {
      setError("passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { username, email, password });
      router.replace("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.logoBox}>
              <Text style={s.logoIcon}>▣</Text>
            </View>
            <Text style={s.logoText}>storeroom</Text>
          </View>
          <Text style={s.subtitle}>create your account</Text>

          <View style={s.form}>
            {[
              { placeholder: "username", value: username, setter: setUsername },
              {
                placeholder: "email",
                value: email,
                setter: setEmail,
                keyboard: "email-address",
              },
              {
                placeholder: "password",
                value: password,
                setter: setPassword,
                secure: true,
              },
              {
                placeholder: "confirm password",
                value: confirm,
                setter: setConfirm,
                secure: true,
              },
            ].map((field, i) => (
              <TextInput
                key={i}
                style={s.input}
                placeholder={field.placeholder}
                placeholderTextColor="#444"
                value={field.value}
                onChangeText={field.setter}
                autoCapitalize="none"
                secureTextEntry={field.secure}
                keyboardType={field.keyboard as any}
              />
            ))}

            {error ? <Text style={s.error}>{error}</Text> : null}

            <TouchableOpacity
              style={s.btn}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={s.btnText}>
                {loading ? "creating account..." : "create account →"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ alignItems: "center", marginTop: 4 }}
            >
              <Text style={s.link}>← back to sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080909" },
  scroll: {
    flexGrow: 1,
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
  link: { color: "#555", fontSize: 11, fontFamily: "monospace" },
});
