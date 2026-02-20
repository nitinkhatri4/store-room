import { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { dark } = useTheme();

  useEffect(() => {
    fetchChats();
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

  return (
    <div
      style={{ background: "var(--bg-primary)" }}
      className="flex h-screen overflow-hidden"
    >
      <div className={`sidebar-wrap ${sidebarOpen ? '' : 'closed'}`} style={{ width: sidebarOpen ? 256 : 0 }}>
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      </div>
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
  );
}
