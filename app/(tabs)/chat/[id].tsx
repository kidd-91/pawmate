import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useChatStore } from "../../../stores/chatStore";

export default function ChatRoomScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();
  const { messages, fetchMessages, sendMessage, subscribeToMessages, unsubscribe } =
    useChatStore();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMine = item.sender_id === myUserId;

          return (
            <View
              style={[
                styles.bubbleRow,
                isMine ? styles.bubbleRowRight : styles.bubbleRowLeft,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.myBubble : styles.otherBubble,
                ]}
              >
                {!isMine && item.sender && (
                  <Text style={styles.senderName}>{item.sender.display_name}</Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myText : styles.otherText,
                  ]}
                >
                  {item.content}
                </Text>
                <Text style={[styles.time, isMine ? styles.myTime : styles.otherTime]}>
                  {new Date(item.created_at).toLocaleTimeString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
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
              color={colors.primary}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  bubbleRowRight: {
    justifyContent: "flex-end",
  },
  bubbleRowLeft: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
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
  senderName: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 2,
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
