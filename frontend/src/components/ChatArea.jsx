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
        height: "100%",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        background: dragging ? "var(--bg-1)" : "var(--bg-0)",
        transition: "background 0.15s",
      }}
    >
      {dragging && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            border: "1px dashed var(--border-hover)",
            borderRadius: 4,
            margin: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            pointerEvents: "none",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="1.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p
            style={{
              color: "var(--text-2)",
              fontSize: 13,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            drop to upload
          </p>
        </div>
      )}

      {uploading && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            zIndex: 40,
            background: "var(--bg-2)",
            border: "1px solid var(--border-hover)",
            borderRadius: 4,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-2)"
            strokeWidth="2"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span
            style={{
              fontSize: 12,
              fontFamily: "'Geist Mono', monospace",
              color: "var(--text-2)",
            }}
          >
            uploading...
          </span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: "var(--bg-0)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 16px 10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button className="icon-btn" onClick={onToggleSidebar}>
          <svg
            width="13"
            height="13"
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
          <>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
              }}
            >
              {chat.name}
            </span>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                color: "var(--text-3)",
                marginLeft: 2,
              }}
            >
              {items.length} items
            </span>
          </>
        ) : (
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 13,
              color: "var(--text-3)",
            }}
          >
            select a collection
          </span>
        )}
      </div>

      {!chat ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="1"
          >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          </svg>
          <p
            style={{
              fontFamily: "'Geist Mono', monospace",
              color: "var(--text-3)",
              fontSize: 13,
            }}
          >
            pick a collection or create one
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
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
                <p
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    color: "var(--text-3)",
                    fontSize: 13,
                  }}
                >
                  nothing stored yet
                </p>
                <p
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    color: "var(--text-3)",
                    fontSize: 11,
                    opacity: 0.5,
                  }}
                >
                  drop files here or type below ↓
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
