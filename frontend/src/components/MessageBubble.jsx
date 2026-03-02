import { useState, useEffect } from "react";
import Lightbox from "./Lightbox";

const TYPE_CONFIG = {
  note: { bg: "var(--bg-2)", border: "var(--border)", label: "note" },
  password: {
    bg: "rgba(74,144,210,0.08)",
    border: "rgba(74,144,210,0.2)",
    label: "password",
  },
  link: {
    bg: "rgba(107,159,255,0.08)",
    border: "rgba(107,159,255,0.2)",
    label: "link",
  },
  image: { bg: "var(--bg-2)", border: "var(--border)", label: "image" },
  file: {
    bg: "rgba(255,255,255,0.03)",
    border: "var(--border-hover)",
    label: "file",
  },
};

const TypeIcon = ({ type }) => {
  const icons = {
    note: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    password: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4a90d9"
        strokeWidth="2"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    link: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6b9fff"
        strokeWidth="2"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    image: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    file: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
  };
  return icons[type] || icons.note;
};

export default function MessageBubble({ item, onDelete, onEdit }) {
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.note;

  const handleCopy = async (text) => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older mobile browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy. Please select and copy manually.");
    }
  };

  const handleSave = () => {
    onEdit(item.id, { title: item.title, content: editContent });
    setEditing(false);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(item.content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.file_name || item.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const renderContent = () => {
    if (item.type === "password") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 10,
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 13,
              color: revealed ? "var(--text-1)" : "var(--text-3)",
              letterSpacing: revealed ? "normal" : "0.1em",
              wordBreak: "break-all",
            }}
          >
            {revealed
              ? item.content
              : "•".repeat(Math.min(item.content?.length || 10, 14))}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setRevealed(!revealed)}
              style={{
                fontSize: 11,
                fontFamily: "'Geist Mono', monospace",
                color: "var(--text-3)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: isMobile ? "8px 0" : "0",
              }}
            >
              {revealed ? "hide" : "reveal"}
            </button>
            {revealed && (
              <button
                onClick={() => handleCopy(item.content)}
                style={{
                  fontSize: 11,
                  fontFamily: "'Geist Mono', monospace",
                  color: copied ? "#4caf50" : "var(--text-3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: isMobile ? "8px 0" : "0",
                }}
              >
                {copied ? "copied!" : "copy"}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (item.type === "image") {
      return (
        <div
          style={{
            marginTop: 8,
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            src={item.content}
            alt={item.title}
            style={{
              borderRadius: 4,
              maxHeight: 240,
              maxWidth: "100%",
              objectFit: "cover",
              cursor: "zoom-in",
              display: "block",
            }}
            onClick={() =>
              setLightboxSrc({
                src: item.content,
                name: item.file_name || item.title,
              })
            }
          />
          <button
            onClick={handleDownload}
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 36,
              height: 36,
              borderRadius: 4,
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      );
    }

    if (item.type === "link") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <a
            href={item.content}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: isMobile ? 14 : 12,
              color: "#6b9fff",
              wordBreak: "break-all",
              textDecoration: "none",
              flex: 1,
            }}
          >
            {item.content}
          </a>
          <button
            onClick={() => handleCopy(item.content)}
            style={{
              fontSize: 11,
              fontFamily: "'Geist Mono', monospace",
              color: copied ? "#4caf50" : "var(--text-3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              padding: isMobile ? "8px 0" : "0",
            }}
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
      );
    }

    if (item.type === "file") {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            padding: "8px 10px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="2"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <p
            style={{
              fontFamily: "'Geist Mono', monospace",
              color: "var(--text-3)",
              fontSize: 11,
              flex: 1,
            }}
          >
            {item.file_type === "application/pdf"
              ? "click to preview"
              : "click to download"}
          </p>
          <a
            href={item.content}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <button
            onClick={handleDownload}
            style={{
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      );
    }

    if (editing) {
      return (
        <div
          style={{
            marginTop: 6,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-hover)",
              borderRadius: 4,
              padding: "7px 10px",
              color: "var(--text-1)",
              outline: "none",
              resize: "none",
              fontSize: isMobile ? 16 : 13,
              fontFamily: "'Geist', sans-serif",
              width: "100%",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleSave}
              style={{
                background: "var(--text-1)",
                color: "#080909",
                border: "none",
                borderRadius: 3,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-3)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Geist Mono', monospace",
                padding: "8px 12px",
              }}
            >
              cancel
            </button>
          </div>
        </div>
      );
    }

    // Notes
    return (
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "flex-start",
          gap: 8,
          marginTop: 6,
        }}
      >
        <p
          style={{
            fontSize: isMobile ? 14 : 13,
            color: "var(--text-2)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            flex: 1,
          }}
        >
          {item.content}
        </p>
        <button
          onClick={() => handleCopy(item.content)}
          style={{
            fontSize: 11,
            fontFamily: "'Geist Mono', monospace",
            color: copied ? "#4caf50" : "var(--text-3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            marginTop: 2,
            padding: isMobile ? "8px 0" : "0",
          }}
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
    );
  };

  return (
    <>
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc.src}
          fileName={lightboxSrc.name}
          onClose={() => setLightboxSrc(null)}
        />
      )}
      <div
        className="msg-enter"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <div
          style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: "12px 3px 12px 12px",
            padding: "12px",
            width: "fit-content",
            maxWidth: "min(520px, 95%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ color: "var(--text-3)" }}>
                <TypeIcon type={item.type} />
              </span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "var(--text-1)",
                  fontSize: isMobile ? 14 : 13,
                  fontWeight: 500,
                }}
              >
                {item.title}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "var(--text-3)",
                  fontSize: isMobile ? 12 : 11,
                }}
              >
                {formatTime(item.created_at)}
              </span>
              {item.type === "note" && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    fontSize: isMobile ? 12 : 11,
                    fontFamily: "'Geist Mono', monospace",
                    color: "var(--text-3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: isMobile ? "4px" : "0",
                  }}
                >
                  edit
                </button>
              )}
              <button
                onClick={() => onDelete(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  display: "flex",
                  alignItems: "center",
                  padding: isMobile ? "4px" : "0",
                }}
              >
                <svg
                  width={isMobile ? "13" : "11"}
                  height={isMobile ? "13" : "11"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </>
  );
}
