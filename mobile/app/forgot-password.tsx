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
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) {
      setError("email is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <View style={s.inner}>
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.logoBox}>
              <Text style={s.logoIcon}>▣</Text>
            </View>
            <Text style={s.logoText}>storeroom</Text>
          </View>

          {sent ? (
            <View style={s.form}>
              <View
                style={{
                  padding: 12,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "rgba(74,222,128,0.2)",
                  backgroundColor: "rgba(74,222,128,0.05)",
                }}
              >
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 18,
                  }}
                >
                  check your email for a reset link. it may take a minute.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={s.btn}
              >
                <Text style={s.btnText}>back to sign in →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={s.subtitle}>reset your password</Text>
              <View style={s.form}>
                <TextInput
                  style={s.input}
                  placeholder="your email address"
                  placeholderTextColor="#444"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {error ? <Text style={s.error}>{error}</Text> : null}
                <TouchableOpacity
                  style={s.btn}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={s.btnText}>
                    {loading ? "sending..." : "send reset link →"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ alignItems: "center", marginTop: 4 }}
                >
                  <Text style={s.link}>← back to sign in</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080909" },
  inner: {
    flex: 1,
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
