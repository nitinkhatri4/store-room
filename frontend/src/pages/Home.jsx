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

  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    fetchChats();
  }, []);

  // Handle initial sidebar state
  useEffect(() => {
    if (!isMobile()) {
      setSidebarOpen(true);
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile()) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchItems(activeChat.id);
      navigate(`/${encodeURIComponent(activeChat.name)}`);
    }
  }, [activeChat]);

  useEffect(() => {
    if (chatName && chats.length > 0) {
      const found = chats.find(
        (c) =>
          c.name.toLowerCase() === decodeURIComponent(chatName).toLowerCase(),
      );
      if (found) {
        setActiveChat(found);
      }
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
    if (isMobile()) setSidebarOpen(false);
  };

  const handleDeleteChat = async (id) => {
    try {
      console.log("Deleting chat with id:", id); // Debug log
      await api.delete(`/chats/${id}`);
      console.log("Delete successful");

      // Update chats list
      setChats((prev) => {
        const newChats = prev.filter((c) => c.id !== id);
        console.log("Updated chats:", newChats);
        return newChats;
      });

      // If the deleted chat was active, clear it
      if (activeChat?.id === id) {
        console.log("Clearing active chat");
        setActiveChat(null);
        setItems([]);
        navigate("/");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };

  const handleRenameChat = async (id, name) => {
    await api.put(`/chats/${id}`, { name });
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    if (activeChat?.id === id) {
      setActiveChat((prev) => ({ ...prev, name }));
      navigate(`/${encodeURIComponent(name)}`);
    }
  };

  const handleSendItem = async (itemData) => {
    if (!activeChat) return;
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
    if (isMobile()) setSidebarOpen(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--bg-0)",
        display: "flex",
        position: "relative",
      }}
    >
      {/* Mobile backdrop - only show when sidebar is open on mobile */}
      {sidebarOpen && isMobile() && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar - always rendered but positioned differently on mobile */}
      <div
        style={{
          width: isMobile()
            ? sidebarOpen
              ? "260px"
              : "0px"
            : sidebarOpen
              ? "220px"
              : "0px", // Collapse completely on desktop too
          height: "100%",
          backgroundColor: "var(--bg-1)",
          borderRight:
            !isMobile() && sidebarOpen ? "1px solid var(--border)" : "none",
          overflow: "hidden",
          transition: "width 0.3s ease",
          position: isMobile() ? "fixed" : "relative",
          left: 0,
          top: 0,
          zIndex: 1000,
          flexShrink: 0,
          boxShadow:
            isMobile() && sidebarOpen ? "2px 0 10px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {sidebarOpen && (
          <Sidebar
            chats={chats}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
          />
        )}
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          height: "100%",
          width: isMobile()
            ? "100%"
            : `calc(100% - ${sidebarOpen ? "220px" : "0px"})`,
          transition: "width 0.3s ease",
        }}
      >
        <ChatArea
          chat={activeChat}
          items={items}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSendItem={handleSendItem}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
        />
      </div>
    </div>
  );
}
