import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function Share() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api
      .get(`/chats/shared/${token}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Collection not found or link is invalid.");
        setLoading(false);
      });
  }, [token]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080909",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#444", fontFamily: "monospace", fontSize: 13 }}>
          loading...
        </span>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080909",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#444", fontFamily: "monospace", fontSize: 13 }}>
          {error}
        </span>
      </div>
    );

  const { chat, items } = data;

  return (
    <div
      style={{
        height: "100vh",
        background: "#080909",
        color: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header — fixed */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#080909",
          borderBottom: "1px solid rgba(255,255,255,0.09)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{ color: "#444", fontFamily: "monospace", fontSize: 11 }}
          >
            storeroom
          </span>
          <span style={{ color: "#333" }}>·</span>
          <span
            style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 500 }}
          >
            {chat.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{ fontFamily: "monospace", fontSize: 11, color: "#444" }}
          >
            {items.length} items
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#333",
              padding: "2px 8px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
            }}
          >
            read only
          </span>
        </div>
      </div>

      {/* Scrollable items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {items.length === 0 ? (
            <p
              style={{
                fontFamily: "monospace",
                color: "#444",
                fontSize: 13,
                textAlign: "center",
                marginTop: 60,
              }}
            >
              nothing here
            </p>
          ) : (
            items.map((item) => (
              <SharedItem
                key={item.id}
                item={item}
                onImageClick={setLightbox}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "40px 0 24px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            marginTop: 40,
          }}
        >
          <a
            href="https://storeroomapp.me"
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#444",
              textDecoration: "none",
            }}
          >
            storeroomapp.me — your personal vault
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            cursor: "pointer",
          }}
        >
          <img
            src={lightbox}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            alt=""
          />
        </div>
      )}
    </div>
  );
}

function SharedItem({ item, onImageClick }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const badgeColors = {
    note: "#555",
    password: "#4a90d9",
    link: "#6b9fff",
    image: "#555",
    file: "#555",
  };
  const badgeLabels = {
    note: "NOTE",
    password: "PWD",
    link: "LINK",
    image: "IMG",
    file: "FILE",
  };
  const bgColors = {
    note: "#141618",
    password: "rgba(74,144,210,0.06)",
    link: "rgba(107,159,255,0.06)",
    image: "#141618",
    file: "rgba(255,255,255,0.02)",
  };
  const borderColors = {
    note: "rgba(255,255,255,0.09)",
    password: "rgba(74,144,210,0.18)",
    link: "rgba(107,159,255,0.18)",
    image: "rgba(255,255,255,0.09)",
    file: "rgba(255,255,255,0.1)",
  };

  return (
    <div
      style={{
        background: bgColors[item.type] || "#141618",
        border: `1px solid ${borderColors[item.type] || "rgba(255,255,255,0.09)"}`,
        borderRadius: 6,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 8,
            color: badgeColors[item.type] || "#555",
            border: `1px solid ${badgeColors[item.type] || "#555"}`,
            borderRadius: 3,
            padding: "2px 6px",
            letterSpacing: 0.5,
            flexShrink: 0,
          }}
        >
          {badgeLabels[item.type] || "NOTE"}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "#f0f0f0",
            fontWeight: 500,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#444",
            flexShrink: 0,
          }}
        >
          {time}
        </span>
      </div>

      {item.type === "note" && (
        <div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "#aaa",
              lineHeight: 1.6,
              margin: "0 0 8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {item.content}
          </p>
          <button
            onClick={() => copy(item.content)}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: copied ? "#4ade80" : "#555",
              background: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            {copied ? "copied!" : "copy"}
          </button>
        </div>
      )}

      {item.type === "password" && (
        <div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: revealed ? "#e0e0e0" : "#333",
              letterSpacing: revealed ? 0 : 5,
              margin: "0 0 8px",
            }}
          >
            {revealed ? item.content : "• • • • • • • •"}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setRevealed((p) => !p)}
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#666",
                background: "none",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              {revealed ? "hide" : "reveal"}
            </button>
            {revealed && (
              <button
                onClick={() => copy(item.content)}
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: copied ? "#4ade80" : "#666",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 3,
                  padding: "2px 8px",
                  cursor: "pointer",
                }}
              >
                {copied ? "copied!" : "copy"}
              </button>
            )}
          </div>
        </div>
      )}

      {item.type === "link" && (
        <div>
          <a
            href={item.content}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#6b9fff",
              display: "block",
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.content}
          </a>
          <div style={{ display: "flex", gap: 6 }}>
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#6b9fff",
                border: "1px solid rgba(107,159,255,0.2)",
                borderRadius: 3,
                padding: "2px 8px",
                textDecoration: "none",
              }}
            >
              open ↗
            </a>
            <button
              onClick={() => copy(item.content)}
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: copied ? "#4ade80" : "#555",
                background: "none",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              {copied ? "copied!" : "copy"}
            </button>
          </div>
        </div>
      )}

      {item.type === "image" && (
        <img
          src={item.content}
          onClick={() => onImageClick(item.content)}
          style={{
            maxWidth: "60%",
            maxHeight: 200,
            borderRadius: 4,
            cursor: "pointer",
            objectFit: "cover",
            display: "block",
          }}
          alt={item.title}
        />
      )}

      {item.type === "file" && (
        <div style={{ display: "flex", gap: 6 }}>
          <a
            href={item.content}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#0e1011",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 4,
              textDecoration: "none",
              flex: 1,
            }}
          >
            <span
              style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa" }}
            >
              {item.file_type === "application/pdf"
                ? "tap to preview"
                : "open file"}
            </span>
          </a>
          <a
            href={item.content}
            download={item.file_name || item.title}
            style={{
              padding: "8px 14px",
              background: "#0e1011",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 4,
              color: "#888",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            ↓
          </a>
        </div>
      )}
    </div>
  );
}
