import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Chip, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useWalkGroupStore } from "../../../stores/walkGroupStore";
import { WALKING_TIME_OPTIONS } from "../../../types";
import PawBackground from "../../../components/PawBackground";
import CalendarPicker from "../../../components/CalendarPicker";

const TIME_LABELS: Record<string, string> = {
  morning: "🌅 早上",
  afternoon: "☀️ 下午",
  evening: "🌙 晚上",
};

export default function WalkGroupDetailScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { session, myDog } = useAuthStore();
  const {
    currentGroup,
    members,
    messages,
    fetchGroup,
    fetchMembers,
    fetchMessages,
    joinGroup,
    leaveGroup,
    sendMessage,
    subscribeToMessages,
    unsubscribe,
    updateGroup,
  } = useWalkGroupStore();
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("morning");
  const [editNotes, setEditNotes] = useState("");
  const [editMaxMembers, setEditMaxMembers] = useState("5");
  const [savingEdit, setSavingEdit] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isCreator = currentGroup?.creator_id === session?.user?.id;
  const isMember = members.some((m) => m.user_id === session?.user?.id);
  const canJoin = !isCreator && !isMember && (currentGroup?.member_count ?? 1) < (currentGroup?.max_members ?? 5);

  useEffect(() => {
    if (groupId) {
      fetchGroup(groupId);
      fetchMembers(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    if (currentGroup) {
      navigation.setOptions({ title: currentGroup.title });
    }
  }, [currentGroup]);

  useEffect(() => {
    if (showChat && groupId) {
      fetchMessages(groupId);
      subscribeToMessages(groupId);
    }
    return () => unsubscribe();
  }, [showChat, groupId]);

  useEffect(() => {
    if (messages.length > 0 && showChat) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const startEditing = () => {
    if (!currentGroup) return;
    setEditTitle(currentGroup.title);
    setEditLocation(currentGroup.location);
    setEditDate(currentGroup.walk_date);
    setEditTime(currentGroup.walk_time);
    setEditNotes(currentGroup.notes || "");
    setEditMaxMembers(String(currentGroup.max_members));
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!groupId || !editTitle.trim() || !editLocation.trim() || !editDate) {
      Alert.alert("請填寫完整", "標題、地點和日期為必填");
      return;
    }
    setSavingEdit(true);
    const result = await updateGroup(groupId, {
      title: editTitle.trim(),
      location: editLocation.trim(),
      walk_date: editDate,
      walk_time: editTime,
      notes: editNotes.trim(),
      max_members: parseInt(editMaxMembers) || 5,
    });
    setSavingEdit(false);
    if (result) {
      setEditing(false);
      fetchGroup(groupId);
    } else {
      Alert.alert("儲存失敗", "請稍後再試");
    }
  };

  const handleJoin = async () => {
    if (!groupId || !session?.user?.id || !myDog) return;
    const ok = await joinGroup(groupId, session.user.id, myDog.id);
    if (ok) Alert.alert("加入成功！", "你已加入揪團，快來群聊認識大家吧！");
  };

  const handleLeave = () => {
    if (!groupId || !session?.user?.id) return;
    Alert.alert("確認離開", "確定要離開這個揪團嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "離開",
        style: "destructive",
        onPress: () => leaveGroup(groupId, session!.user.id),
      },
    ]);
  };

  const handleSend = () => {
    if (!text.trim() || !groupId || !session?.user?.id) return;
    sendMessage(groupId, session.user.id, text.trim());
    setText("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} 週${days[date.getDay()]}`;
  };

  if (!currentGroup) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  // Chat mode
  if (showChat) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <PawBackground />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setShowChat(false)} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
            <Text style={styles.chatHeaderTitle}>揪團詳情</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderSub}>{currentGroup.title} 群聊</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMine = item.sender_id === session?.user?.id;
            // Find avatar: check creator dog or member dog
            const memberDog = members.find((m) => m.user_id === item.sender_id)?.dog;
            const avatarUri =
              currentGroup?.creator_id === item.sender_id
                ? currentGroup?.creator_dog?.photos?.[0]
                : memberDog?.photos?.[0];

            return (
              <View style={[styles.bubbleRow, isMine ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
                {!isMine && (
                  avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.msgAvatar} />
                  ) : (
                    <View style={styles.msgAvatarPlaceholder}>
                      <Text style={{ fontSize: 16 }}>🐶</Text>
                    </View>
                  )
                )}
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
                  {!isMine && (
                    <Text style={styles.senderName}>{item.sender?.display_name ?? "匿名"}</Text>
                  )}
                  <Text style={[styles.messageText, isMine ? styles.myText : styles.otherText]}>
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

  // Detail mode
  return (
    <View style={styles.container}>
      <PawBackground />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.detailContent}>
            {/* Info card or Edit form */}
            {editing ? (
              <View style={styles.infoCard}>
                <Text style={styles.editSectionLabel}>📝 標題</Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={styles.editInput}
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />

                <Text style={styles.editSectionLabel}>📍 地點</Text>
                <TextInput
                  value={editLocation}
                  onChangeText={setEditLocation}
                  style={styles.editInput}
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />

                <Text style={styles.editSectionLabel}>📅 日期</Text>
                <CalendarPicker
                  selected={editDate}
                  onSelect={setEditDate}
                  maxDate={(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; })()}
                />

                <Text style={[styles.editSectionLabel, { marginTop: spacing.md }]}>🕐 時段</Text>
                <SegmentedButtons
                  value={editTime}
                  onValueChange={setEditTime}
                  buttons={WALKING_TIME_OPTIONS.map((t) => ({
                    value: t.value,
                    label: t.label,
                  }))}
                  style={{ marginBottom: spacing.sm }}
                />

                <Text style={styles.editSectionLabel}>👥 人數上限</Text>
                <TextInput
                  value={editMaxMembers}
                  onChangeText={setEditMaxMembers}
                  keyboardType="numeric"
                  style={styles.editInput}
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />

                <Text style={styles.editSectionLabel}>💬 備註</Text>
                <TextInput
                  value={editNotes}
                  onChangeText={setEditNotes}
                  multiline
                  numberOfLines={3}
                  style={[styles.editInput, { minHeight: 80, textAlignVertical: "top" }]}
                  mode="outlined"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />

                <View style={styles.editBtnRow}>
                  <Button
                    mode="outlined"
                    textColor={colors.textSecondary}
                    onPress={() => setEditing(false)}
                    style={styles.editCancelBtn}
                  >
                    取消
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor={colors.primary}
                    onPress={handleSaveEdit}
                    loading={savingEdit}
                    disabled={savingEdit}
                    style={styles.editSaveBtn}
                  >
                    儲存
                  </Button>
                </View>
              </View>
            ) : (
            <View style={styles.infoCard}>
              <View style={styles.titleRow}>
                <Text style={styles.groupTitle}>{currentGroup.title}</Text>
                {isCreator && (
                  <TouchableOpacity onPress={startEditing} style={styles.editIconBtn}>
                    <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
                <Text style={styles.infoText}>{formatDate(currentGroup.walk_date)}</Text>
                <Text style={styles.timeBadge}>{TIME_LABELS[currentGroup.walk_time]}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                <Text style={styles.infoText}>{currentGroup.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account-group" size={18} color={colors.primary} />
                <Text style={styles.infoText}>
                  {(members.length + 1)}/{currentGroup.max_members} 位參加者
                </Text>
              </View>

              {currentGroup.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>備註</Text>
                  <Text style={styles.notesText}>{currentGroup.notes}</Text>
                </View>
              ) : null}
            </View>
            )}

            {/* Creator */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>發起人</Text>
              <View style={styles.memberRow}>
                {currentGroup.creator_dog?.photos?.[0] ? (
                  <Image source={{ uri: currentGroup.creator_dog.photos[0] }} style={styles.memberAvatar} />
                ) : (
                  <View style={styles.memberAvatarPlaceholder}>
                    <Text style={{ fontSize: 20 }}>🐶</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.memberName}>{currentGroup.creator_dog?.name}</Text>
                  <Text style={styles.memberOwner}>
                    主人：{currentGroup.creator_dog?.owner?.display_name}
                  </Text>
                </View>
                <Chip compact style={styles.creatorBadge} textStyle={{ color: "#FFF", fontSize: 11 }}>
                  發起人
                </Chip>
              </View>
            </View>

            {/* Members */}
            {members.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>參加者</Text>
                {members.map((m) => (
                  <View key={m.id} style={styles.memberRow}>
                    {m.dog?.photos?.[0] ? (
                      <Image source={{ uri: m.dog.photos[0] }} style={styles.memberAvatar} />
                    ) : (
                      <View style={styles.memberAvatarPlaceholder}>
                        <Text style={{ fontSize: 20 }}>🐶</Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.memberName}>{m.dog?.name}</Text>
                      <Text style={styles.memberOwner}>
                        主人：{m.profile?.display_name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              {canJoin && (
                <Button
                  mode="contained"
                  buttonColor={colors.primary}
                  onPress={handleJoin}
                  style={styles.actionBtn}
                  icon="paw"
                >
                  加入揪團
                </Button>
              )}
              {(isCreator || isMember) && (
                <Button
                  mode="contained"
                  buttonColor={colors.primary}
                  onPress={() => setShowChat(true)}
                  style={styles.actionBtn}
                  icon="chat"
                >
                  群聊
                </Button>
              )}
              {isMember && !isCreator && (
                <Button
                  mode="outlined"
                  textColor={colors.accent}
                  onPress={handleLeave}
                  style={styles.actionBtn}
                  icon="exit-run"
                >
                  離開揪團
                </Button>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  detailContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,140,105,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  editSectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  editInput: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  editBtnRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editCancelBtn: {
    flex: 1,
    borderRadius: 25,
    borderColor: colors.border,
  },
  editSaveBtn: {
    flex: 1,
    borderRadius: 25,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
  },
  timeBadge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notesBox: {
    backgroundColor: "rgba(255,140,105,0.08)",
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,140,105,0.2)",
  },
  memberAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,140,105,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
  },
  memberOwner: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  creatorBadge: {
    backgroundColor: colors.primary,
    marginLeft: "auto",
  },
  actionRow: {
    gap: spacing.sm,
  },
  actionBtn: {
    borderRadius: 25,
  },
  // Chat styles
  chatHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chatHeaderTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chatHeaderSub: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 2,
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
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
  msgAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,140,105,0.15)",
    alignItems: "center",
    justifyContent: "center",
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
