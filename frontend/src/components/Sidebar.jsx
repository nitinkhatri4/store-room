import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}) {
  const [newChatName, setNewChatName] = useState("");
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    onNewChat(newChatName.trim());
    setNewChatName("");
    setShowInput(false);
  };

  const submitRename = (id) => {
    if (renameVal.trim()) onRenameChat(id, renameVal.trim());
    setRenamingId(null);
  };

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        background: "var(--bg-1)",
        borderRight: "1px solid var(--border-1)",
        width: 256,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 14px 12px",
          borderBottom: "1px solid var(--border-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              width: 32,
              height: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            📦
          </div>
          <span
            style={{
              color: "var(--text-1)",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "-0.01em",
            }}
          >
            Storeroom
          </span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
            title="Toggle theme"
            style={{ fontSize: 13 }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            className="icon-btn danger"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            title="Logout"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 10px 4px" }}>
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-3)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              color: "var(--text-1)",
              outline: "none",
              fontSize: 12,
              fontFamily: "inherit",
              flex: 1,
              minWidth: 0,
            }}
          />
        </div>
      </div>

      {/* New chat */}
      <div style={{ padding: "6px 10px 8px" }}>
        {showInput ? (
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 6 }}>
            <input
              autoFocus
              type="text"
              placeholder="Name your chat..."
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onBlur={() => {
                if (!newChatName.trim()) setShowInput(false);
              }}
              style={{
                flex: 1,
                background: "var(--bg-2)",
                border: "1px solid var(--accent-border)",
                borderRadius: 10,
                padding: "8px 12px",
                color: "var(--text-1)",
                outline: "none",
                fontSize: 12,
                fontFamily: "inherit",
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              className="icon-btn accent"
              style={{ width: 34, height: 34 }}
            >
              ✓
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px dashed var(--border-2)",
              background: "transparent",
              color: "var(--text-2)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-2)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        )}
      </div>

      {/* Divider label */}
      <div style={{ padding: "2px 14px 6px" }}>
        <span
          style={{
            color: "var(--text-3)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Chats
        </span>
      </div>

      {/* Chat list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {filtered.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  activeChat?.id === chat.id
                    ? "var(--accent)"
                    : "var(--border-3)",
                flexShrink: 0,
                marginRight: 10,
                transition: "background 0.2s",
              }}
            />

            {renamingId === chat.id ? (
              <input
                autoFocus
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onBlur={() => submitRename(chat.id)}
                onKeyDown={(e) => e.key === "Enter" && submitRename(chat.id)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "transparent",
                  outline: "none",
                  color: "var(--text-1)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  flex: 1,
                  minWidth: 0,
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: 12,
                  color:
                    activeChat?.id === chat.id
                      ? "var(--accent)"
                      : "var(--text-2)",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: 40,
                }}
              >
                {chat.name}
              </span>
            )}

            <div className="chat-item-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingId(chat.id);
                  setRenameVal(chat.name);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "var(--text-1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "var(--text-3)")
                }
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "var(--text-3)")
                }
              >
                <svg
                  width="11"
                  height="11"
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
        ))}

        {filtered.length === 0 && (
          <p
            style={{
              color: "var(--text-3)",
              fontSize: 12,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            No chats yet
          </p>
        )}
      </div>
    </div>
  );
}
