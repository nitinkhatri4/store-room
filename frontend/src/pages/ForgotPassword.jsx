import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("reset link sent. check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-0)",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      className="fade-in"
    >
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  border: "1px solid var(--border-hover)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-2)"
                  strokeWidth="2"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-1)",
                }}
              >
                storeroom
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                color: "var(--text-3)",
              }}
            >
              reset your password
            </p>
          </div>

          <div
            style={{
              padding: "16px 20px 20px",
              background: "var(--bg-0)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "var(--bg-1)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text-1)",
                fontSize: 12,
                fontFamily: "'Geist', sans-serif",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--border-hover)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />

            {error && (
              <p
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "var(--danger)",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 4,
                  padding: "7px 10px",
                  fontSize: 11,
                }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "#4ade80",
                  background: "rgba(74,222,128,0.06)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  borderRadius: 4,
                  padding: "7px 10px",
                  fontSize: 11,
                }}
              >
                {success}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "9px",
                background: "var(--text-1)",
                color: "#080909",
                border: "none",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Geist', sans-serif",
                cursor: "pointer",
                marginTop: 2,
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "sending..." : "send reset link →"}
            </button>

            <div style={{ textAlign: "center", marginTop: 2 }}>
              <Link
                to="/login"
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10,
                  color: "var(--text-3)",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => (e.target.style.color = "var(--text-1)")}
                onMouseOut={(e) => (e.target.style.color = "var(--text-3)")}
              >
                back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
