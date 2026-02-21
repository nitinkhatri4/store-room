import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import api from "../api";

export default function ChatArea({
  chat,
  items,
  sidebarOpen,
  onToggleSidebar,
  onSendItem,
  onDeleteItem,
  onEditItem,
}) {
  const bottomRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items?.length > 0) setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    if (!chat) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await onSendItem({
          type: res.data.is_image ? "image" : "file",
          title: res.data.file_name,
          content: res.data.url,
          file_name: res.data.file_name,
          file_type: res.data.file_type,
        });
      } catch (err) {
        console.error(err);
      }
    }
    setUploading(false);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        background: dragging ? "var(--bg-1)" : "var(--bg-0)",
        transition: "background 0.2s ease",
      }}
    >
      {/* Drag overlay */}
      {dragging && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "rgba(240,165,0,0.04)",
            border: "2px dashed var(--accent-border)",
            borderRadius: 16,
            margin: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            📎
          </div>
          <p style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}>
            Drop to upload
          </p>
          <p style={{ color: "var(--text-3)", fontSize: 12 }}>
            Images and files supported
          </p>
        </div>
      )}

      {/* Upload indicator */}
      {uploading && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 40,
            background: "var(--bg-3)",
            border: "1px solid var(--accent-border)",
            borderRadius: 10,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>
            Uploading...
          </span>
        </div>
      )}

      {/* HEADER — always visible, always on top */}
      <div
        style={{
          background: "var(--bg-1)",
          borderBottom: "1px solid var(--border-1)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          title="Toggle sidebar"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {chat ? (
          <div>
            <h2
              style={{
                color: "var(--text-1)",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "-0.01em",
              }}
            >
              {chat.name}
            </h2>
            <p style={{ color: "var(--text-3)", fontSize: 11, marginTop: 1 }}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>
            Select a chat
          </span>
        )}
      </div>

      {/* BODY */}
      {!chat ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-2)",
              width: 64,
              height: 64,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            📦
          </div>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>
            Pick a chat or create one
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {items.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 80,
                  gap: 6,
                }}
              >
                <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                  Nothing stored yet
                </p>
                <p
                  style={{ color: "var(--text-3)", fontSize: 11, opacity: 0.5 }}
                >
                  Drop files here or type below ↓
                </p>
              </div>
            ) : (
              items.map((item) => (
                <MessageBubble
                  key={item.id}
                  item={item}
                  onDelete={onDeleteItem}
                  onEdit={onEditItem}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <InputBar onSend={onSendItem} />
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
