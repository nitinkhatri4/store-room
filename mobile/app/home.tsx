import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";

const SB = StatusBar.currentHeight || 0;

export default function Home() {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renamingChat, setRenamingChat] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    api
      .get("/chats")
      .then((res) => {
        setChats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    AsyncStorage.getItem("username").then((u) => {
      if (u) setUsername(u);
    });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await api.post("/chats", { name: newName.trim() });
      setChats((prev) => [res.data, ...prev]);
      setNewName("");
      setShowNew(false);
    } catch {
      Alert.alert("Error", "Failed to create collection");
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/chats/${id}`);
          setChats((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  const handleRename = async () => {
    if (!renameName.trim() || !renamingChat) return;
    try {
      await api.put(`/chats/${renamingChat.id}`, { name: renameName.trim() });
      setChats((prev) =>
        prev.map((c) =>
          c.id === renamingChat.id ? { ...c, name: renameName.trim() } : c,
        ),
      );
      setShowRename(false);
      setRenamingChat(null);
      setRenameName("");
    } catch {
      Alert.alert("Error", "Failed to rename");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/login");
        },
      },
    ]);
  };

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[s.container, { paddingTop: SB }]}>
      <StatusBar barStyle="light-content" backgroundColor="#080909" />

      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>▣</Text>
          </View>
          <Text style={s.logoText}>storeroom</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {username ? <Text style={s.userText}>{username}</Text> : null}
          <TouchableOpacity onPress={handleLogout}>
            <Text style={s.logoutText}>logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput
          style={s.searchInput}
          placeholder="search collections..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: "#555", fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Section label + new button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Text style={s.sectionLabel}>COLLECTIONS · {filtered.length}</Text>
        <TouchableOpacity onPress={() => setShowNew(true)} style={s.newBtn}>
          <Text style={s.newBtnText}>+ new</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.04)",
              marginHorizontal: 16,
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={s.empty}>
            {loading
              ? "loading..."
              : search
                ? "no results"
                : "no collections yet\ncreate one above ↑"}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.chatItem}
            onPress={() =>
              router.push({
                pathname: "/collection",
                params: { id: item.id, name: item.name },
              })
            }
            onLongPress={() => {
              Alert.alert(item.name, "What do you want to do?", [
                {
                  text: "Rename",
                  onPress: () => {
                    setRenamingChat(item);
                    setRenameName(item.name);
                    setShowRename(true);
                  },
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDelete(item.id, item.name),
                },
                { text: "Cancel", style: "cancel" },
              ]);
            }}
          >
            <View style={s.dot} />
            <Text style={s.chatName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={s.chatCount}>{item.item_count || 0}</Text>
            <Text style={{ color: "#333", fontSize: 14 }}>›</Text>
          </TouchableOpacity>
        )}
      />

      {/* New collection modal */}
      <Modal
        visible={showNew}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNew(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNew(false)}
        >
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>new collection</Text>
            <TextInput
              style={s.modalInput}
              placeholder="collection name..."
              placeholderTextColor="#444"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <TouchableOpacity style={s.modalBtn} onPress={handleCreate}>
              <Text style={s.modalBtnText}>create →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename modal */}
      <Modal
        visible={showRename}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRename(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRename(false)}
        >
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>rename collection</Text>
            <TextInput
              style={s.modalInput}
              placeholder="new name..."
              placeholderTextColor="#444"
              value={renameName}
              onChangeText={setRenameName}
              autoFocus
              onSubmitEditing={handleRename}
            />
            <TouchableOpacity style={s.modalBtn} onPress={handleRename}>
              <Text style={s.modalBtnText}>rename →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080909" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.09)",
  },
  logoBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: { color: "#888", fontSize: 10 },
  logoText: {
    color: "#f0f0f0",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "monospace",
  },
  userText: { color: "#555", fontSize: 11, fontFamily: "monospace" },
  logoutText: { color: "#444", fontSize: 11, fontFamily: "monospace" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    padding: 10,
    backgroundColor: "#0e1011",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 4,
    gap: 8,
  },
  searchIcon: { color: "#444", fontSize: 16 },
  searchInput: {
    flex: 1,
    color: "#f0f0f0",
    fontSize: 13,
    fontFamily: "monospace",
  },
  sectionLabel: {
    color: "#444",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1.5,
  },
  newBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 3,
  },
  newBtnText: { color: "#888", fontSize: 11, fontFamily: "monospace" },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#333" },
  chatName: { flex: 1, color: "#aaa", fontSize: 13, fontFamily: "monospace" },
  chatCount: {
    color: "#444",
    fontSize: 11,
    fontFamily: "monospace",
    marginRight: 4,
  },
  empty: {
    color: "#444",
    fontSize: 12,
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: 60,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#0e1011",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: 20,
    gap: 12,
  },
  modalTitle: { color: "#f0f0f0", fontSize: 13, fontFamily: "monospace" },
  modalInput: {
    backgroundColor: "#141618",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 4,
    padding: 12,
    color: "#f0f0f0",
    fontSize: 13,
    fontFamily: "monospace",
  },
  modalBtn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#080909",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "monospace",
  },
});
