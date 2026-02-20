import { useState, useRef } from "react";
import api from "../api";

const isURL = (str) => {
  try {
    new URL(str);
    return str.startsWith("http");
  } catch {
    return false;
  }
};

export default function InputBar({ onSend }) {
  const [text, setText] = useState("");
  const [isPassword, setIsPassword] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = () => {
    const val = text.trim();
    if (!val) return;

    let type = "note";
    let title = val.length > 50 ? val.slice(0, 50) + "..." : val;

    if (isPassword) {
      type = "password";
      title = "Password";
    } else if (isURL(val)) {
      type = "link";
      try {
        title = new URL(val).hostname;
      } catch {
        title = val.slice(0, 40);
      }
    }

    onSend({ type, title, content: val });
    setText("");
    setIsPassword(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setShowAttach(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSend({
        type: res.data.is_image ? "image" : "file",
        title: res.data.file_name,
        content: res.data.url,
        file_name: res.data.file_name,
        file_type: res.data.file_type,
      });
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-1)",
        borderTop: "1px solid var(--border-1)",
        padding: "10px 14px 12px",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Attach menu — vertical list */}
      {showAttach && (
        <div
          className="pop-up"
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            marginBottom: 8,
            background: "var(--bg-3)",
            border: "1px solid var(--border-2)",
            borderRadius: 14,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 180,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <button
            onClick={() => {
              imageRef.current.click();
              setShowAttach(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 10,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
              textAlign: "left",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "var(--bg-4)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(96,165,250,0.12)",
                border: "1px solid rgba(96,165,250,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              🖼
            </div>
            <div>
              <p
                style={{
                  color: "var(--text-1)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Image
              </p>
              <p style={{ color: "var(--text-3)", fontSize: 10, marginTop: 1 }}>
                jpg, png, gif, webp
              </p>
            </div>
          </button>
          <button
            onClick={() => {
              fileRef.current.click();
              setShowAttach(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 10,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
              textAlign: "left",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "var(--bg-4)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  color: "var(--text-1)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                File
              </p>
              <p style={{ color: "var(--text-3)", fontSize: 10, marginTop: 1 }}>
                pdf, txt, doc, csv, zip
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Input row */}
      <div
        className="input-bar-wrap"
        style={{
          background: "var(--bg-2)",
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          padding: "6px 6px 6px 8px",
        }}
      >
        {/* + attach */}
        <button
          onClick={() => setShowAttach((p) => !p)}
          disabled={uploading}
          className={`icon-btn ${showAttach ? "active-gold" : ""}`}
          style={{ width: 34, height: 34, flexShrink: 0 }}
          title="Attach"
        >
          {uploading ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                transform: showAttach ? "rotate(45deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>

        {/* 🔒 password toggle */}
        <button
          onClick={() => setIsPassword((p) => !p)}
          className={`icon-btn ${isPassword ? "active-gold" : ""}`}
          style={{ width: 34, height: 34, flexShrink: 0 }}
          title="Mark as password"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          placeholder={
            isPassword
              ? "Paste your password..."
              : "Type a note, paste a link..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          className={isPassword ? "mono" : ""}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: isPassword ? "var(--accent)" : "var(--text-1)",
            fontSize: 13,
            fontFamily: isPassword
              ? "IBM Plex Mono, monospace"
              : "Sora, sans-serif",
            lineHeight: 1.5,
            padding: "6px 4px",
            maxHeight: 130,
            overflowY: "auto",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
          }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`icon-btn ${text.trim() ? "accent" : ""}`}
          style={{ width: 34, height: 34, flexShrink: 0 }}
          title="Send"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx,.csv,.zip,.mp3,.mp4,.xls,.xlsx,.ppt,.pptx"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
