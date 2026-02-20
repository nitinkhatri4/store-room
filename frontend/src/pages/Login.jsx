import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: "var(--bg-0)", minHeight: "100vh" }}
      className="flex items-center justify-center p-4 fade-in"
    >
      <button
        onClick={() => setDark(!dark)}
        className="icon-btn fixed top-5 right-5"
        style={{ width: 36, height: 36, fontSize: 16 }}
      >
        {dark ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <div
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              width: 52,
              height: 52,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 22,
            }}
          >
            📦
          </div>
          <h1
            style={{
              color: "var(--text-1)",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Storeroom
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>
            Your personal vault
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border-2)",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-2)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "transparent",
                  color: "var(--text-1)",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "inherit",
                  borderBottom: "1px solid var(--border-1)",
                }}
                placeholder-style={{ color: "var(--text-3)" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "transparent",
                  color: "var(--text-1)",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--accent)",
                color: "#000",
                fontWeight: 600,
                fontSize: 14,
                padding: "12px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                marginTop: 4,
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
