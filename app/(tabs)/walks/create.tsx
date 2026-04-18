import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text, TextInput, Button, Chip, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useWalkGroupStore } from "../../../stores/walkGroupStore";
import { WALKING_TIME_OPTIONS } from "../../../types";

export default function CreateWalkScreen() {
  const { session, myDog } = useAuthStore();
  const { createGroup } = useWalkGroupStore();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [walkDate, setWalkDate] = useState("");
  const [walkTime, setWalkTime] = useState("morning");
  const [notes, setNotes] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");
  const [saving, setSaving] = useState(false);

  // Generate date options for next 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    let label = `${d.getMonth() + 1}/${d.getDate()} 週${days[d.getDay()]}`;
    if (i === 0) label = "今天";
    if (i === 1) label = "明天";
    return { value: dateStr, label };
  });

  const handleCreate = async () => {
    if (!session?.user?.id || !myDog) return;
    if (!title.trim() || !location.trim() || !walkDate) {
      Alert.alert("請填寫完整", "標題、地點和日期為必填");
      return;
    }

    setSaving(true);
    const group = await createGroup({
      creator_id: session.user.id,
      creator_dog_id: myDog.id,
      title: title.trim(),
      location: location.trim(),
      walk_date: walkDate,
      walk_time: walkTime,
      notes: notes.trim(),
      max_members: parseInt(maxMembers) || 5,
    });

    setSaving(false);
    if (group) {
      router.replace(`/(tabs)/walks/${group.id}`);
    } else {
      Alert.alert("建立失敗", "請稍後再試");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formCard}>
        <Text style={styles.label}>📝 揪團標題</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="例：大安森林公園遛狗趣"
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Text style={styles.label}>📍 地點</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="例：大安森林公園"
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Text style={styles.label}>📅 日期</Text>
        <View style={styles.dateGrid}>
          {dateOptions.map((opt) => (
            <Chip
              key={opt.value}
              selected={walkDate === opt.value}
              onPress={() => setWalkDate(opt.value)}
              style={[
                styles.dateChip,
                walkDate === opt.value && styles.selectedChip,
              ]}
              textStyle={walkDate === opt.value ? styles.selectedChipText : undefined}
            >
              {opt.label}
            </Chip>
          ))}
        </View>

        <Text style={styles.label}>🕐 時段</Text>
        <SegmentedButtons
          value={walkTime}
          onValueChange={setWalkTime}
          buttons={WALKING_TIME_OPTIONS.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
          style={styles.segment}
        />

        <Text style={styles.label}>👥 人數上限</Text>
        <TextInput
          value={maxMembers}
          onChangeText={setMaxMembers}
          keyboardType="numeric"
          placeholder="例：5"
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />

        <Text style={styles.label}>💬 備註</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="例：請自備水碗和零食"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.notesInput]}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={saving}
        disabled={saving || !title.trim() || !location.trim() || !walkDate}
        buttonColor={colors.primary}
        style={styles.createBtn}
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        icon="paw"
      >
        發起揪團
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.sm,
  },
  dateChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedChipText: {
    color: "#FFF",
  },
  segment: {
    marginBottom: spacing.sm,
  },
  createBtn: {
    marginTop: spacing.lg,
    borderRadius: 25,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
