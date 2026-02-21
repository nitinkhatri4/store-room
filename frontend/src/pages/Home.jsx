import { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchChats();
    // open sidebar by default only on desktop
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    if (activeChat) fetchItems(activeChat.id);
    else setItems([]);
  }, [activeChat]);

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
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--bg-0)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Backdrop for sidebar on mobile */}
      {sidebarOpen && (
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

      {/* Sidebar — always overlay on top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100dvh",
          width: 256,
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
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
          height: "100dvh",
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
