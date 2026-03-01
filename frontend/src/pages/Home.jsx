import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chatName } = useParams();
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024;

  useEffect(() => {
    fetchChats();
    // open sidebar by default only on desktop
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchItems(activeChat.id);
      navigate(`/${encodeURIComponent(activeChat.name)}`);
    } else {
      setItems([]);
    }
  }, [activeChat]);

  useEffect(() => {
    if (chatName && chats.length > 0) {
      const found = chats.find(
        (c) =>
          c.name.toLowerCase() === decodeURIComponent(chatName).toLowerCase(),
      );
      if (found) setActiveChat(found);
    }
  }, [chatName, chats]);

  const fetchChats = async () => {
    const res = await api.get("/chats");
    setChats(res.data);
  };

  const fetchItems = async (chatId) => {
    const res = await api.get(`/items/${chatId}`);
    setItems(res.data);
  };

  const handleNewChat = async (name) => {
    const res = await api.post("/chats", { name });
    setChats((prev) => [res.data, ...prev]);
    setActiveChat(res.data);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (id) => {
    await api.delete(`/chats/${id}`);
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChat?.id === id) setActiveChat(null);
  };

  const handleRenameChat = async (id, name) => {
    await api.put(`/chats/${id}`, { name });
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    if (activeChat?.id === id) setActiveChat((prev) => ({ ...prev, name }));
    navigate(`/${encodeURIComponent(name)}`); // add this line
  };

  const handleSendItem = async (itemData) => {
    const res = await api.post("/items", {
      ...itemData,
      chat_id: activeChat.id,
    });
    setItems((prev) => [...prev, res.data]);
  };

  const handleDeleteItem = async (id) => {
    await api.delete(`/items/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleEditItem = async (id, data) => {
    const res = await api.put(`/items/${id}`, data);
    setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
  };

  const handleSelectChat = (chat) => {
    navigate(`/${encodeURIComponent(chat.name)}`);
    setActiveChat(chat);
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--bg-0)",
        // position: "relative",
        display: "flex",
        flexDirection: "row",
        // flexDirection: "column",
      }}
    >
      {/* Backdrop for sidebar on mobile */}
      {/* {sidebarOpen && window.innerWidth < 768 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
        />
      )} */}

      {/* Sidebar — always overlay on top */}
      <div
        style={{
          width: sidebarOpen ? 256 : 0,
          transition: "width 0.25s ease",
          overflow: "hidden",
          height: "100%",
          borderRight: sidebarOpen ? "1px solid var(--border-1)" : "none",
          flexShrink: 0,
        }}
      >
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      </div>

      {/* Chat area — always full width */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
        }}
      >
        <ChatArea
          chat={activeChat}
          items={items}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          onSendItem={handleSendItem}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
        />
      </div>
    </div>
  );
}
