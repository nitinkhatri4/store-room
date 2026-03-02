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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(48);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Measure header height after render
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isMobile]);

  useEffect(() => {
    // Use setTimeout to ensure scroll happens after render
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: dragging ? "var(--bg-1)" : "var(--bg-0)",
        transition: "background 0.15s",
        position: "relative",
        overflow: "hidden", // Prevent scrolling at container level
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
            top: 60,
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

      {/* HEADER with ref to measure height */}
      <div
        ref={headerRef}
        style={{
          background: "var(--bg-0)",
          borderBottom: "1px solid var(--border)",
          padding: isMobile ? "0 12px" : "0 16px",
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 8 : 10,
          height: 48,
          minHeight: 48, // Force minimum height
          flexShrink: 0,
          zIndex: 10,
          width: "100%",
        }}
      >
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          style={{
            width: isMobile ? 36 : 28,
            height: isMobile ? 36 : 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width={isMobile ? "16" : "13"}
            height={isMobile ? "16" : "13"}
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
                fontSize: isMobile ? 15 : 14,
                fontWeight: 500,
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {chat.name}
            </span>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: isMobile ? 12 : 11,
                color: "var(--text-3)",
                marginLeft: 2,
                flexShrink: 0,
              }}
            >
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </>
        ) : (
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: isMobile ? 15 : 13,
              color: "var(--text-3)",
              flex: 1,
            }}
          >
            select a collection
          </span>
        )}
      </div>

      {/* Scrollable content area with calculated height */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          padding: isMobile ? "8px 10px" : "12px 20px", // Add padding on sides
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center the content
          gap: 4,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : "800px", // Slightly wider // Nice readable width, not too wide
            margin: "0 auto", // Center it
            padding: isMobile ? "0" : "0 24px", // More padding on sides
          }}
        >
          {!chat ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: "100%",
              }}
            >
              <svg
                width={isMobile ? "40" : "32"}
                height={isMobile ? "40" : "32"}
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
                  fontSize: isMobile ? 14 : 13,
                  textAlign: "center",
                  padding: "0 20px",
                }}
              >
                pick a collection or create one
              </p>
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minHeight: "100%",
              }}
            >
              <p
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "var(--text-3)",
                  fontSize: isMobile ? 14 : 13,
                }}
              >
                nothing stored yet
              </p>
              <p
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  color: "var(--text-3)",
                  fontSize: isMobile ? 12 : 11,
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
          <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
        </div>
      </div>

      {/* INPUT — always visible when chat is selected */}
      {chat && (
        <div style={{ flexShrink: 0 }}>
          <InputBar onSend={onSendItem} />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
