import { useState } from "react";
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
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 12px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              border: "1px solid var(--border-hover)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="10"
              height="10"
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
        <button
          className="icon-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          title="Logout"
          style={{ flexShrink: 0 }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 10px 6px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 10px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-1)",
              outline: "none",
              fontSize: 13,
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* New chat */}
      <div style={{ padding: "4px 10px 8px", flexShrink: 0 }}>
        {showInput ? (
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 5 }}>
            <input
              autoFocus
              type="text"
              placeholder="collection name..."
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onBlur={() => {
                if (!newChatName.trim()) setShowInput(false);
              }}
              style={{
                flex: 1,
                background: "var(--bg-2)",
                border: "1px solid var(--border-hover)",
                borderRadius: 4,
                padding: "7px 10px",
                color: "var(--text-1)",
                outline: "none",
                fontSize: 13,
                fontFamily: "'Geist Mono', monospace",
              }}
            />
            <button
              type="submit"
              className="icon-btn accent"
              style={{ width: 30, height: 30 }}
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
              gap: 7,
              padding: "7px 10px",
              borderRadius: 4,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-3)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            new chat
          </button>
        )}
      </div>

      {/* Collections label */}
      <div style={{ padding: "4px 12px 4px", flexShrink: 0 }}>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-3)",
          }}
        >
          collections
        </span>
      </div>

      {/* Chat list - scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2px 6px 12px",
        }}
      >
        {filtered.length === 0 ? (
          <p
            style={{
              color: "var(--text-3)",
              fontSize: 12,
              fontFamily: "'Geist Mono', monospace",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            no collections yet
          </p>
        ) : (
          filtered.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "7px 8px",
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor:
                  activeChat?.id === chat.id ? "var(--bg-3)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor:
                    activeChat?.id === chat.id
                      ? "var(--text-1)"
                      : "var(--text-3)",
                  marginRight: 8,
                  flexShrink: 0,
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
                    border: "none",
                    outline: "none",
                    color: "var(--text-1)",
                    fontSize: 13,
                    fontFamily: "'Geist Mono', monospace",
                    flex: 1,
                  }}
                />
              ) : (
                <>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "'Geist Mono', monospace",
                      color:
                        activeChat?.id === chat.id
                          ? "var(--text-1)"
                          : "var(--text-2)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "'Geist Mono', monospace",
                      color: "var(--text-3)",
                      marginRight: 4,
                      flexShrink: 0,
                    }}
                  >
                    {chat.item_count || ""}
                  </span>
                </>
              )}

              {/* Actions */}
              {!renamingId && (
                <div
                  className="chat-item-actions"
                  style={{
                    display: "none",
                    position: "absolute",
                    right: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    alignItems: "center",
                    gap: 2,
                    background: "var(--bg-4)",
                    borderRadius: 4,
                    padding: 2,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(chat.id);
                      setRenameVal(chat.name);
                    }}
                    className="icon-btn"
                    style={{ width: 22, height: 22 }}
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
                      e.stopPropagation(); // Prevent triggering the parent onClick
                      e.preventDefault();
                      console.log(
                        "Delete clicked for chat:",
                        chat.id,
                        chat.name,
                      ); // Add for debugging
                      if (window.confirm(`Delete "${chat.name}"?`)) {
                        onDeleteChat(chat.id);
                      }
                    }}
                    className="icon-btn danger"
                    style={{ width: 22, height: 22 }}
                    title="Delete chat"
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
                      <path d="M10 9v5" />
                      <path d="M14 9v5" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
