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
        padding: "10px 0 16px",
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="input-bar-wrap"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
          padding: "8px 10px",
          width: "min(680px, 90%)",
          position: "relative",
        }}
      >
        {/* Attach menu */}
        {showAttach && (
          <div
            className="pop-up"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              marginBottom: 6,
              background: "var(--bg-2)",
              border: "1px solid var(--border-hover)",
              borderRadius: 6,
              padding: 4,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: 160,
            }}
          >
            {[
              {
                label: "image",
                sub: "jpg, png, gif, webp",
                ref: imageRef,
                icon: (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-2)"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                ),
              },
              {
                label: "file",
                sub: "pdf, doc, zip, csv",
                ref: fileRef,
                icon: (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-2)"
                    strokeWidth="2"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                ),
              },
            ].map(({ label, sub, ref, icon }) => (
              <button
                key={label}
                onClick={() => {
                  ref.current.click();
                  setShowAttach(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 10px",
                  borderRadius: 4,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Geist', sans-serif",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "var(--bg-3)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {icon}
                <div>
                  <p
                    style={{
                      color: "var(--text-1)",
                      fontSize: 11,
                      fontFamily: "'Geist Mono', monospace",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      color: "var(--text-3)",
                      fontSize: 10,
                      marginTop: 1,
                    }}
                  >
                    {sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* + attach */}
        <button
          onClick={() => setShowAttach((p) => !p)}
          disabled={uploading}
          className={`icon-btn ${showAttach ? "active-state" : ""}`}
          style={{ width: 28, height: 28, flexShrink: 0 }}
          title="Attach"
        >
          {uploading ? (
            <svg
              width="11"
              height="11"
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
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                transform: showAttach ? "rotate(45deg)" : "none",
                transition: "transform 0.15s",
              }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>

        {/* password toggle */}
        <button
          onClick={() => setIsPassword((p) => !p)}
          className={`icon-btn ${isPassword ? "active-state" : ""}`}
          style={{ width: 28, height: 28, flexShrink: 0 }}
          title="Mark as password"
        >
          <svg
            width="11"
            height="11"
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
              ? "paste your password..."
              : "type a note, paste a link..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: "var(--text-1)",
            fontSize: 12,
            fontFamily: isPassword
              ? "'Geist Mono', monospace"
              : "'Geist', sans-serif",
            lineHeight: 1.5,
            padding: "5px 4px",
            maxHeight: 120,
            overflowY: "auto",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`icon-btn ${text.trim() ? "accent" : ""}`}
          style={{ width: 28, height: 28, flexShrink: 0 }}
          title="Send"
        >
          <svg
            width="11"
            height="11"
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
