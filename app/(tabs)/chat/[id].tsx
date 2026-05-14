import { useEffect, useMemo, useRef, useState } from "react";
import type { Message } from "../../../types";

// Items rendered in the chat FlatList: messages interleaved with date
// dividers ("今天" / "昨天" / "5月12日 (週一)"). Built once per messages
// change in a useMemo below.
type ChatItem =
  | { type: "divider"; id: string; label: string }
  | { type: "message"; id: string; msg: Message };

function formatDayLabel(d: Date): string {
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (sameDay(d, today)) return "今天";
  if (sameDay(d, yesterday)) return "昨天";

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const w = weekdays[d.getDay()];
  // Cross-year shows the year, otherwise just month/day for compactness.
  const sameYear = d.getFullYear() === today.getFullYear();
  return sameYear
    ? `${d.getMonth() + 1}月${d.getDate()}日 (週${w})`
    : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (週${w})`;
}

import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useMatchStore } from "../../../stores/matchStore";
import { useChatStore } from "../../../stores/chatStore";
import { useKeyboardHeight } from "../../../lib/useKeyboardHeight";
import PawBackground from "../../../components/PawBackground";

export default function ChatRoomScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { session, myDog } = useAuthStore();
  const { matches } = useMatchStore();
  const navigation = useNavigation();
  const router = useRouter();
  const { messages, fetchMessages, sendMessage, subscribeToMessages, unsubscribe } =
    useChatStore();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Find the other dog from the match
  const match = matches.find((m) => m.id === matchId);
  const otherDog =
    match && myDog
      ? match.dog_a_id === myDog.id
        ? match.dog_b
        : match.dog_a
      : null;

  // Set custom header with dog name and avatar
  useEffect(() => {
    if (otherDog) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.replace("/(tabs)/chat")} style={{ marginRight: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <TouchableOpacity
            style={styles.headerRow}
            onPress={() => router.push(`/(tabs)/dog/${otherDog.id}?from=chat`)}
            activeOpacity={0.7}
          >
            <Image
              source={
                otherDog.photos?.length
                  ? { uri: otherDog.photos[0] }
                  : require("../../../assets/icon.png")
              }
              style={styles.headerAvatar}
            />
            <Text style={styles.headerName}>{otherDog.name}</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [otherDog]);

  useEffect(() => {
    if (matchId) {
      fetchMessages(matchId);
      subscribeToMessages(matchId);
    }
    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim() || !matchId || !session?.user?.id) return;
    sendMessage(matchId, session.user.id, text.trim());
    setText("");
  };

  const myUserId = session?.user?.id;
  const keyboardHeight = useKeyboardHeight();

  // Build a list of [date-divider, message, message, date-divider, ...]
  // by walking through messages in chronological order and inserting a
  // divider whenever the day changes (LINE-style). Memoized so we
  // only recompute when messages change.
  const items = useMemo<ChatItem[]>(() => {
    const out: ChatItem[] = [];
    let lastDay = "";
    for (const m of messages) {
      const d = new Date(m.created_at);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dayKey !== lastDay) {
        out.push({ type: "divider", id: `d-${dayKey}`, label: formatDayLabel(d) });
        lastDay = dayKey;
      }
      out.push({ type: "message", id: m.id, msg: m });
    }
    return out;
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // iOS handles padding natively; on Android we apply keyboardHeight
      // as bottom padding to the input bar below, which sidesteps the
      // edgeToEdge / new-arch quirks where behavior="height" doesn't
      // actually move the input above the keyboard.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <PawBackground />
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          if (item.type === "divider") {
            return (
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{item.label}</Text>
                <View style={styles.dividerLine} />
              </View>
            );
          }

          const m = item.msg;
          const isMine = m.sender_id === myUserId;

          return (
            <View
              style={[
                styles.bubbleRow,
                isMine ? styles.bubbleRowRight : styles.bubbleRowLeft,
              ]}
            >
              {/* Other dog's avatar */}
              {!isMine && (
                <Image
                  source={
                    otherDog?.photos?.length
                      ? { uri: otherDog.photos[0] }
                      : require("../../../assets/icon.png")
                  }
                  style={styles.msgAvatar}
                />
              )}
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.myBubble : styles.otherBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myText : styles.otherText,
                  ]}
                >
                  {m.content}
                </Text>
                <Text style={[styles.time, isMine ? styles.myTime : styles.otherTime]}>
                  {new Date(m.created_at).toLocaleTimeString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View
        style={[
          styles.inputBar,
          // Android: shove the input bar up by the keyboard height so
          // it sits exactly above the keyboard. iOS already handles
          // this via KeyboardAvoidingView padding.
          Platform.OS === "android" && { paddingBottom: spacing.sm + keyboardHeight },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="輸入訊息..."
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          dense
          right={
            <TextInput.Icon
              icon="send"
              color={text.trim() ? colors.primary : colors.textSecondary}
              onPress={handleSend}
            />
          }
          onSubmitEditing={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    fontWeight: "500",
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    alignItems: "flex-end",
  },
  bubbleRowRight: {
    justifyContent: "flex-end",
  },
  bubbleRowLeft: {
    justifyContent: "flex-start",
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  bubble: {
    maxWidth: "70%",
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: "#FFF",
  },
  otherText: {
    color: colors.text,
  },
  time: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "right",
  },
  myTime: {
    color: "rgba(255,255,255,0.6)",
  },
  otherTime: {
    color: "rgba(0,0,0,0.35)",
  },
  inputBar: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    backgroundColor: colors.surface,
  },
});
