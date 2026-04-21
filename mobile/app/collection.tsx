import { useState, useEffect, useRef } from "react";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Linking,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as ClipboardAPI from "expo-clipboard";
import * as ExpoSharing from "expo-sharing";
import api from "../api";

const { width: SW } = Dimensions.get("window");
const SB = StatusBar.currentHeight || 0;

const TYPE_COLORS: any = {
  note: { bg: "#141618", border: "rgba(255,255,255,0.09)" },
  password: { bg: "rgba(74,144,210,0.08)", border: "rgba(74,144,210,0.2)" },
  link: { bg: "rgba(107,159,255,0.08)", border: "rgba(107,159,255,0.2)" },
  image: { bg: "#141618", border: "rgba(255,255,255,0.09)" },
  file: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.12)" },
};

const isURL = (str: string) => {
  try {
    new URL(str);
    return str.startsWith("http");
  } catch {
    return false;
  }
};

function Badge({ label, color = "#555" }: { label: string; color?: string }) {
  return (
    <View
      style={{
        width: 34,
        height: 22,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: color,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        flexShrink: 0,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 8,
          fontFamily: "monospace",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function TextBtn({
  label,
  onPress,
  color = "#555",
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      style={{
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color, fontSize: 10, fontFamily: "monospace" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DeleteBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 12,
            height: 1.5,
            backgroundColor: "#4a4a4a",
            borderRadius: 1,
            marginBottom: 1,
          }}
        />
        <View
          style={{
            width: 5,
            height: 1.5,
            backgroundColor: "#4a4a4a",
            borderRadius: 1,
            marginTop: -4,
            marginBottom: 2,
          }}
        />
        <View
          style={{
            width: 10,
            height: 8,
            borderWidth: 1.5,
            borderColor: "#4a4a4a",
            borderTopWidth: 0,
            borderBottomLeftRadius: 1,
            borderBottomRightRadius: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 2,
            }}
          >
            <View
              style={{
                width: 1,
                height: 4,
                backgroundColor: "#4a4a4a",
                borderRadius: 1,
              }}
            />
            <View
              style={{
                width: 1,
                height: 4,
                backgroundColor: "#4a4a4a",
                borderRadius: 1,
              }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PreviewModal({
  visible,
  content,
  type,
  onClose,
}: {
  visible: boolean;
  content: string;
  type: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await ClipboardAPI.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: "#141618",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.12)",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          padding: 20,
          maxHeight: "70%",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: "#666",
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: 1,
            }}
          >
            {type.toUpperCase()}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text
              style={{ color: "#555", fontFamily: "monospace", fontSize: 11 }}
            >
              close
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            color: "#e0e0e0",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 20,
            marginBottom: 16,
          }}
          selectable
        >
          {content}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextBtn
            label={copied ? "copied!" : "copy"}
            onPress={copy}
            color={copied ? "#4ade80" : "#888"}
          />
          {type === "link" && (
            <TextBtn
              label="open ↗"
              onPress={() => {
                Linking.openURL(content);
                onClose();
              }}
              color="#6b9fff"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function LightboxViewer({
  src,
  onClose,
  onDownload,
}: {
  src: string | null;
  onClose: () => void;
  onDownload: () => void;
}) {
  const scale = useSharedValue(1);
  const pinchRef = useRef(null);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const onPinchEvent = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.ACTIVE)
      scale.value = Math.max(1, Math.min(nativeEvent.scale, 5));
  };
  const onPinchEnd = ({ nativeEvent }: any) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      if (scale.value < 1.1) scale.value = withTiming(1);
    }
  };
  if (!src) return null;
  return (
    <GestureHandlerRootView style={s.lightbox}>
      <View
        style={{
          position: "absolute",
          top: 50,
          right: 16,
          flexDirection: "row",
          gap: 8,
          zIndex: 10,
        }}
      >
        <TouchableOpacity style={s.lightboxBtn} onPress={onDownload}>
          <Text style={{ color: "#f0f0f0", fontSize: 16 }}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.lightboxBtn}
          onPress={() => {
            scale.value = 1;
            onClose();
          }}
        >
          <Text style={{ color: "#f0f0f0", fontSize: 14 }}>✕</Text>
        </TouchableOpacity>
      </View>
      <PinchGestureHandler
        ref={pinchRef}
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchEnd}
      >
        <Animated.View style={[{ width: SW, height: SW * 1.5 }, animStyle]}>
          <Image
            source={{ uri: src }}
            style={{ width: SW, height: SW * 1.5 }}
            resizeMode="contain"
          />
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
}

function ItemCard({
  item,
  onDelete,
  onImagePress,
  onEdit,
}: {
  item: any;
  onDelete: (id: number) => void;
  onImagePress: (src: string) => void;
  onEdit: (id: number, content: string, title: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(item.content);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState(false);
  const cfg = TYPE_COLORS[item.type] || TYPE_COLORS.note;
  const time = new Date(item.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  useEffect(() => {
    setEditVal(item.content);
  }, [item.content]);

  const copy = async (text: string) => {
    await ClipboardAPI.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveEdit = async (newVal: string) => {
    const newTitle = newVal.length > 50 ? newVal.slice(0, 50) + "..." : newVal;
    try {
      await api.put(`/items/${item.id}`, { content: newVal, title: newTitle });
      onEdit(item.id, newVal, newTitle);
    } catch {
      Alert.alert("Error", "Could not save");
    }
    setEditing(false);
  };

  const handleDownload = async (
    url: string,
    filename: string,
    mimeType?: string,
  ) => {
    setDownloading(true);
    try {
      const localUri = FileSystem.documentDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(url, localUri);
      const isImage = mimeType?.startsWith("image/");
      if (isImage) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Saved", `${filename} saved to gallery ✓`);
        } else {
          Alert.alert(
            "Permission denied",
            "Allow storage permission to save images",
          );
        }
      } else {
        // PDFs and other files — use share sheet
        await Sharing.shareAsync(uri, {
          dialogTitle: filename,
          mimeType: mimeType || "*/*",
        });
      }
    } catch (e) {
      console.log("download error", e);
      Alert.alert("Error", "Download failed: " + String(e));
    } finally {
      setDownloading(false);
    }
  };

  const badgeProps: any = {
    note: { label: "NOTE", color: "#555" },
    password: { label: "PWD", color: "#4a90d9" },
    link: { label: "LINK", color: "#6b9fff" },
    image: { label: "IMG", color: "#555" },
    file: { label: "FILE", color: "#555" },
  };
  const bp = badgeProps[item.type] || badgeProps.note;

  const renderContent = () => {
    if (item.type === "password") {
      return (
        <View style={{ marginTop: 8 }}>
          <Text
            style={{
              color: revealed ? "#e0e0e0" : "#333",
              fontFamily: "monospace",
              fontSize: 13,
              letterSpacing: revealed ? 0 : 5,
              marginBottom: 8,
            }}
          >
            {revealed ? item.content : "• • • • • • • •"}
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <TextBtn
              label={revealed ? "hide" : "reveal"}
              onPress={() => setRevealed((p) => !p)}
              color="#666"
            />
            {revealed && (
              <TextBtn
                label={copied ? "copied!" : "copy"}
                onPress={() => copy(item.content)}
                color={copied ? "#4ade80" : "#666"}
              />
            )}
          </View>
        </View>
      );
    }

    if (item.type === "image") {
      return (
        <TouchableOpacity
          onPress={() => onImagePress(item.content)}
          activeOpacity={0.85}
          style={{ marginTop: 8 }}
        >
          <Image
            source={{ uri: item.content }}
            style={{ width: "65%", height: 130, borderRadius: 4 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (item.type === "link") {
      return (
        <View style={{ marginTop: 6 }}>
          <TouchableOpacity onPress={() => Linking.openURL(item.content)}>
            <Text
              style={{
                color: "#6b9fff",
                fontFamily: "monospace",
                fontSize: 11,
                lineHeight: 17,
                marginBottom: 8,
              }}
              numberOfLines={1}
            >
              {item.content}
            </Text>
          </TouchableOpacity>
          {editing ? (
            <View>
              <TextInput
                value={editVal}
                onChangeText={setEditVal}
                autoFocus
                style={{
                  color: "#f0f0f0",
                  fontFamily: "monospace",
                  fontSize: 12,
                  backgroundColor: "#1a1d1f",
                  borderRadius: 4,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  marginBottom: 8,
                }}
              />
              <View style={{ flexDirection: "row", gap: 6 }}>
                <TextBtn
                  label="save"
                  onPress={() => saveEdit(editVal)}
                  color="#f0f0f0"
                />
                <TextBtn
                  label="cancel"
                  onPress={() => {
                    setEditVal(item.content);
                    setEditing(false);
                  }}
                  color="#555"
                />
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <TextBtn
                label="open ↗"
                onPress={() => Linking.openURL(item.content)}
                color="#6b9fff"
              />
              <TextBtn
                label="edit"
                onPress={() => setEditing(true)}
                color="#555"
              />
              <TextBtn
                label="more"
                onPress={() => setPreview(true)}
                color="#555"
              />
              <TextBtn
                label={copied ? "copied!" : "copy"}
                onPress={() => copy(item.content)}
                color={copied ? "#4ade80" : "#555"}
              />
            </View>
          )}
          <PreviewModal
            visible={preview}
            content={item.content}
            type="link"
            onClose={() => setPreview(false)}
          />
        </View>
      );
    }

    if (item.type === "file") {
      const filename = item.file_name || item.title;
      return (
        <View style={{ marginTop: 8, flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL(item.content)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: 10,
              backgroundColor: "#0e1011",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.09)",
            }}
          >
            <Badge label="FILE" color="#555" />
            <Text
              style={{ color: "#aaa", fontFamily: "monospace", fontSize: 11 }}
            >
              {item.file_type === "application/pdf"
                ? "tap to preview"
                : "tap to open"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleDownload(item.content, filename, item.file_type)
            }
            style={{
              paddingHorizontal: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0e1011",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.09)",
            }}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={{ color: "#888", fontSize: 16 }}>↓</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (editing) {
      return (
        <View style={{ marginTop: 8 }}>
          <TextInput
            value={editVal}
            onChangeText={setEditVal}
            autoFocus
            multiline
            style={{
              color: "#f0f0f0",
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 20,
              backgroundColor: "#1a1d1f",
              borderRadius: 4,
              padding: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              minHeight: 60,
            }}
          />
          <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
            <TextBtn
              label="save"
              onPress={() => saveEdit(editVal)}
              color="#f0f0f0"
            />
            <TextBtn
              label="cancel"
              onPress={() => {
                setEditVal(item.content);
                setEditing(false);
              }}
              color="#555"
            />
          </View>
        </View>
      );
    }

    return (
      <View style={{ marginTop: 6 }}>
        <Text
          style={{
            color: "#aaa",
            fontSize: 13,
            lineHeight: 20,
            marginBottom: 8,
          }}
          numberOfLines={3}
        >
          {item.content}
        </Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          <TextBtn label="edit" onPress={() => setEditing(true)} color="#555" />
          <TextBtn label="more" onPress={() => setPreview(true)} color="#555" />
          <TextBtn
            label={copied ? "copied!" : "copy"}
            onPress={() => copy(item.content)}
            color={copied ? "#4ade80" : "#555"}
          />
        </View>
        <PreviewModal
          visible={preview}
          content={item.content}
          type="note"
          onClose={() => setPreview(false)}
        />
      </View>
    );
  };

  return (
    <View style={{ paddingLeft: "20%" }}>
      <View
        style={[s.card, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Badge label={bp.label} color={bp.color} />
            <Text style={s.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <Text style={s.cardTime}>{time}</Text>
            <DeleteBtn onPress={() => onDelete(item.id)} />
          </View>
        </View>
        {renderContent()}
      </View>
    </View>
  );
}

export default function Collection() {
  const { id, name } = useLocalSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    api.get(`/items/${id}`).then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  }, []);

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);

  const handleSend = async () => {
    const val = text.trim();
    if (!val) return;
    setSending(true);
    let type = "note",
      title = val.length > 50 ? val.slice(0, 50) + "..." : val;
    if (isPassword) {
      type = "password";
      title = "Password";
    } else if (isURL(val)) {
      type = "link";
      try {
        title = new URL(val).hostname;
      } catch {
        title = val.slice(0, 40);
      }
    }
    try {
      const res = await api.post("/items", {
        type,
        title,
        content: val,
        chat_id: Number(id),
      });
      setItems((prev) => [...prev, res.data]);
      setText("");
      setIsPassword(false);
      scrollToBottom();
    } catch {
      Alert.alert("Error", "Failed to save");
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (
    uri: string,
    fileName: string,
    mimeType: string,
  ) => {
    setUploading(true);
    setShowAttach(false);
    try {
      const formData = new FormData();
      formData.append("file", { uri, name: fileName, type: mimeType } as any);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const itemRes = await api.post("/items", {
        type: res.data.is_image ? "image" : "file",
        title: fileName,
        content: res.data.url,
        file_name: fileName,
        file_type: res.data.file_type,
        chat_id: Number(id),
      });
      setItems((prev) => [...prev, itemRes.data]);
      scrollToBottom();
    } catch (e: any) {
      console.log("upload error", e?.response?.data || e?.message || e);
      Alert.alert(
        "Error",
        "Upload failed: " +
          (e?.response?.data?.message || e?.message || "unknown error"),
      );
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      for (const a of result.assets) {
        await uploadFile(
          a.uri,
          a.fileName || a.uri.split("/").pop() || "image.jpg",
          a.mimeType || "image/jpeg",
        );
      }
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      for (const a of result.assets) {
        await uploadFile(
          a.uri,
          a.name,
          a.mimeType || "application/octet-stream",
        );
      }
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await api.post(`/chats/${id}/share`);
      const link = `https://storeroomapp.me/share/${res.data.token}`;
      await ClipboardAPI.setStringAsync(link);
      Alert.alert("Link copied!", link, [
        { text: "OK" },
        { text: "Open", onPress: () => Linking.openURL(link) },
      ]);
    } catch (e) {
      Alert.alert("Error", "Could not generate share link");
    } finally {
      setSharing(false);
    }
  };

  const handleDelete = (itemId: number) => {
    Alert.alert("Delete", "Delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/items/${itemId}`);
          setItems((prev) => prev.filter((i) => i.id !== itemId));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: SB }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={SB}
    >
      <StatusBar barStyle="light-content" backgroundColor="#080909" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {uploading && <ActivityIndicator size="small" color="#666" />}
          <Text style={s.headerCount}>{items.length} items</Text>
          <TouchableOpacity
            onPress={handleShare}
            disabled={sharing}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 3,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.09)",
            }}
          >
            <Text
              style={{ color: "#555", fontFamily: "monospace", fontSize: 10 }}
            >
              {sharing ? "..." : "share"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#f0f0f0" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          ListEmptyComponent={
            <Text style={s.empty}>nothing stored yet{"\n"}type below ↓</Text>
          }
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onDelete={handleDelete}
              onImagePress={setLightboxSrc}
              onEdit={(id, content, title) =>
                setItems((prev) =>
                  prev.map((i) => (i.id === id ? { ...i, content, title } : i)),
                )
              }
            />
          )}
        />
      )}

      {showAttach && (
        <View style={s.attachMenu}>
          {[
            {
              label: "image",
              sub: "jpg, png, gif, webp",
              tag: "IMG",
              onPress: pickImage,
            },
            {
              label: "file",
              sub: "pdf, doc, zip, csv",
              tag: "FILE",
              onPress: pickFile,
            },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={s.attachItem}
              onPress={opt.onPress}
            >
              <Badge label={opt.tag} color="#555" />
              <View>
                <Text style={s.attachLabel}>{opt.label}</Text>
                <Text style={s.attachSub}>{opt.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setShowAttach(false)}
            style={{ paddingVertical: 10, alignItems: "center" }}
          >
            <Text
              style={{ color: "#444", fontFamily: "monospace", fontSize: 12 }}
            >
              cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.inputWrap}>
        <TouchableOpacity
          style={[s.iconBtn, showAttach && s.iconBtnActive]}
          onPress={() => setShowAttach((p) => !p)}
          disabled={uploading}
        >
          <Text
            style={{
              color: showAttach ? "#f0f0f0" : "#555",
              fontSize: 20,
              lineHeight: 22,
            }}
          >
            +
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.iconBtn, isPassword && s.iconBtnBlue]}
          onPress={() => setIsPassword((p) => !p)}
        >
          <Text
            style={{
              color: isPassword ? "#4a90d9" : "#555",
              fontFamily: "monospace",
              fontSize: 9,
              letterSpacing: 0.3,
            }}
          >
            PWD
          </Text>
        </TouchableOpacity>
        <TextInput
          style={s.input}
          placeholder={
            isPassword ? "paste password..." : "type a note, paste a link..."
          }
          placeholderTextColor="#444"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[s.sendBtn, text.trim() ? s.sendBtnActive : null]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Text
            style={{
              color: text.trim() ? "#080909" : "#444",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            →
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!lightboxSrc}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxSrc(null)}
      >
        <LightboxViewer
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
          onDownload={async () => {
            if (!lightboxSrc) return;
            try {
              const rawName =
                lightboxSrc.split("/").pop()?.split("?")[0] || "image.jpg";
              const ext = rawName.includes(".")
                ? rawName.split(".").pop()
                : "jpg";
              const filename = rawName.length > 40 ? `image.${ext}` : rawName;
              const localUri = FileSystem.documentDirectory + filename;
              const downloadResult = await FileSystem.downloadAsync(
                lightboxSrc,
                localUri,
              );
              const perm = await MediaLibrary.requestPermissionsAsync();
              if (perm.status === "granted") {
                await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
                Alert.alert("Saved", "Image saved to gallery ✓");
              } else {
                Alert.alert(
                  "Permission denied",
                  "Allow storage permission in settings",
                );
              }
            } catch (e) {
              Alert.alert("Error", "Download failed: " + String(e));
            }
          }}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080909" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.09)",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#f0f0f0", fontSize: 22 },
  headerTitle: {
    flex: 1,
    color: "#f0f0f0",
    fontSize: 15,
    fontFamily: "monospace",
    fontWeight: "500",
  },
  headerCount: { color: "#444", fontSize: 11, fontFamily: "monospace" },
  card: { borderWidth: 1, borderRadius: 6, padding: 12 },
  cardTitle: {
    color: "#f0f0f0",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  cardTime: { color: "#444", fontFamily: "monospace", fontSize: 10 },
  empty: {
    color: "#444",
    fontFamily: "monospace",
    fontSize: 13,
    textAlign: "center",
    marginTop: 60,
    lineHeight: 24,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.09)",
    backgroundColor: "#080909",
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  iconBtnBlue: {
    borderColor: "rgba(74,144,210,0.5)",
    backgroundColor: "rgba(74,144,210,0.08)",
  },
  input: {
    flex: 1,
    color: "#f0f0f0",
    fontSize: 13,
    fontFamily: "monospace",
    maxHeight: 100,
    paddingVertical: 6,
    lineHeight: 20,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: { backgroundColor: "#f0f0f0", borderColor: "#f0f0f0" },
  attachMenu: {
    position: "absolute",
    bottom: 68,
    left: 12,
    right: 12,
    backgroundColor: "#141618",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: 8,
  },
  attachItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 4,
  },
  attachLabel: { color: "#f0f0f0", fontFamily: "monospace", fontSize: 13 },
  attachSub: {
    color: "#444",
    fontFamily: "monospace",
    fontSize: 10,
    marginTop: 2,
  },
  lightbox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.97)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxBtn: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
