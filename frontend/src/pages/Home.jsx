import { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const { dark } = useTheme();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChat) fetchItems(activeChat.id);
    else setItems([]);
  }, [activeChat]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (window.innerWidth < 768) setSidebarOpen(false);
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
    setActiveChat(chat);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        background: "var(--bg-primary)",
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? "fixed" : "relative",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 50 : "auto",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          width: 256,
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

      {/* Chat area always full width on mobile */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
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
