import { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { Text, Modal, Portal, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing, radii, shadows } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useHealthStore } from "../../../stores/healthStore";
import PawBackground from "../../../components/PawBackground";
import type { HealthRecord, HealthRecordType } from "../../../types";

export default function HealthScreen() {
  const router = useRouter();
  const { myDog } = useAuthStore();
  const {
    records,
    types,
    fetchRecords,
    fetchTypes,
    deleteRecord,
  } = useHealthStore();

  const [filter, setFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!myDog) return;
    await Promise.all([fetchRecords(myDog.id, filter ?? undefined), fetchTypes()]);
  }, [myDog, filter, fetchRecords, fetchTypes]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleDelete = (r: HealthRecord) => {
    Alert.alert("刪除這筆紀錄？", `${r.type?.label ?? ""} · ${r.recorded_at}`, [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: async () => {
          const ok = await deleteRecord(r.id);
          if (ok) refresh();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <PawBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>健康紀錄</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        <FilterChip label="全部" icon="🩺" active={filter === null} onPress={() => setFilter(null)} />
        {types.map((t) => (
          <FilterChip
            key={t.code}
            label={t.label}
            icon={t.icon ?? ""}
            active={filter === t.code}
            onPress={() => setFilter(t.code)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🩺</Text>
            <Text style={styles.emptyTitle}>還沒有健康紀錄</Text>
            <Text style={styles.emptyText}>點右下角 + 新增第一筆</Text>
          </View>
        }
        renderItem={({ item }) => (
          <HealthRow record={item} onLongPress={() => handleDelete(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      <HealthFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        types={types}
        dogId={myDog?.id ?? ""}
        defaultType={filter ?? undefined}
        onCreated={() => {
          setShowForm(false);
          refresh();
        }}
      />
    </View>
  );
}

function FilterChip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon ? <Text style={styles.filterChipIcon}>{icon}</Text> : null}
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function HealthRow({
  record,
  onLongPress,
}: {
  record: HealthRecord;
  onLongPress: () => void;
}) {
  const t = record.type;
  const valueText =
    record.numeric_value != null
      ? `${record.numeric_value}${t?.unit ? ` ${t.unit}` : ""}`
      : null;

  return (
    <TouchableOpacity
      style={styles.row}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.rowIconWrap,
          { backgroundColor: t?.color ? `${t.color}22` : "rgba(255,140,105,0.1)" },
        ]}
      >
        <Text style={styles.rowIcon}>{t?.icon ?? "🩺"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.rowTitle}>
            {record.title || t?.label || "紀錄"}
          </Text>
          {valueText ? <Text style={styles.rowValue}>{valueText}</Text> : null}
        </View>
        {record.notes ? (
          <Text style={styles.rowNotes} numberOfLines={1}>
            {record.notes}
          </Text>
        ) : null}
        <View style={styles.rowMeta}>
          <Text style={styles.rowDate}>{record.recorded_at}</Text>
          {record.next_due_at ? (
            <Text style={styles.rowDue}>
              · 下次：{record.next_due_at}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HealthFormModal({
  visible,
  onClose,
  types,
  dogId,
  defaultType,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  types: HealthRecordType[];
  dogId: string;
  defaultType?: string;
  onCreated: () => void;
}) {
  const { createRecord } = useHealthStore();
  const [typeCode, setTypeCode] = useState<string | null>(defaultType ?? null);
  const [title, setTitle] = useState("");
  const [numericValue, setNumericValue] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedType = types.find((t) => t.code === typeCode) ?? null;
  // Numeric input only makes sense for types with a unit (e.g., weight kg)
  const showNumeric = !!selectedType?.unit;
  // Title is most useful for "named" records (vaccine name, drug name, vet visit reason)
  const showTitle = ["vaccine", "medication", "vet_visit"].includes(typeCode ?? "");
  const showNextDue = !!selectedType?.has_reminder;

  const reset = () => {
    setTypeCode(defaultType ?? null);
    setTitle("");
    setNumericValue("");
    setNotes("");
    setNextDueAt("");
  };

  const submit = async () => {
    if (!typeCode) {
      Alert.alert("請選類型");
      return;
    }
    if (!dogId) {
      Alert.alert("沒有狗狗資料");
      return;
    }
    if (showNumeric && !numericValue) {
      Alert.alert("請填數值", `請輸入${selectedType?.label}（${selectedType?.unit}）`);
      return;
    }

    let parsedDue: string | null = null;
    if (showNextDue && nextDueAt) {
      // Accept YYYY-MM-DD only
      if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDueAt)) {
        Alert.alert("下次提醒日期格式錯誤", "請用 YYYY-MM-DD（例：2026-12-31）");
        return;
      }
      parsedDue = nextDueAt;
    }

    setSubmitting(true);
    const created = await createRecord({
      dog_id: dogId,
      type_code: typeCode,
      title,
      numeric_value: showNumeric ? parseFloat(numericValue) : null,
      notes,
      next_due_at: parsedDue,
    });
    setSubmitting(false);

    if (created) {
      reset();
      onCreated();
    } else {
      Alert.alert("新增失敗", "請稍後再試");
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>新增健康紀錄</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>類型</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeScroll}
          >
            {types.map((t) => {
              const active = t.code === typeCode;
              return (
                <TouchableOpacity
                  key={t.code}
                  style={[styles.typeOption, active && styles.typeOptionActive]}
                  onPress={() => setTypeCode(t.code)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.typeOptionIcon}>{t.icon ?? "🩺"}</Text>
                  <Text style={[styles.typeOptionName, active && styles.typeOptionNameActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {showTitle ? (
            <>
              <Text style={styles.formLabel}>
                {typeCode === "vaccine"
                  ? "疫苗名稱"
                  : typeCode === "medication"
                  ? "藥品名稱"
                  : "看診原因"}
              </Text>
              <RNTextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={
                  typeCode === "vaccine"
                    ? "例：八合一疫苗、狂犬病疫苗"
                    : typeCode === "medication"
                    ? "例：心絲蟲預防藥"
                    : "例：定期健檢、皮膚過敏"
                }
                placeholderTextColor={colors.textSecondary}
              />
            </>
          ) : null}

          {showNumeric ? (
            <>
              <Text style={styles.formLabel}>
                {selectedType?.label}（{selectedType?.unit}）
              </Text>
              <RNTextInput
                style={styles.input}
                value={numericValue}
                onChangeText={setNumericValue}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          ) : null}

          {showNextDue ? (
            <>
              <Text style={styles.formLabel}>下次提醒日期（選填）</Text>
              <RNTextInput
                style={styles.input}
                value={nextDueAt}
                onChangeText={setNextDueAt}
                placeholder="YYYY-MM-DD（例：2026-12-31）"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          ) : null}

          <Text style={styles.formLabel}>備註（選填）</Text>
          <RNTextInput
            style={[styles.input, { height: 60, textAlignVertical: "top" }]}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="獸醫建議、用藥說明等"
            placeholderTextColor={colors.textSecondary}
          />

          <Button
            mode="contained"
            buttonColor={colors.primary}
            loading={submitting}
            disabled={submitting}
            onPress={submit}
            style={styles.submitBtn}
          >
            新增
          </Button>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.text },

  filterBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipIcon: { fontSize: 14 },
  filterChipText: { fontSize: 13, color: colors.text, fontWeight: "600" },
  filterChipTextActive: { color: "#FFF" },

  list: { padding: spacing.md, paddingBottom: 120 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    ...shadows.card,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIcon: { fontSize: 20 },
  rowTitleLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
  rowValue: { fontSize: 15, fontWeight: "700", color: colors.primary, marginLeft: spacing.sm },
  rowNotes: { marginTop: 2, fontSize: 12, color: colors.text },
  rowMeta: { marginTop: 2, flexDirection: "row" },
  rowDate: { fontSize: 11, color: colors.textSecondary },
  rowDue: { fontSize: 11, color: colors.textSecondary },

  emptyWrap: { alignItems: "center", paddingTop: 80, paddingHorizontal: spacing.lg },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  emptyText: { marginTop: spacing.sm, fontSize: 14, color: colors.textSecondary, textAlign: "center" },

  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },

  modal: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  formLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  typeScroll: { paddingVertical: spacing.xs, gap: spacing.xs },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: spacing.xs,
  },
  typeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeOptionIcon: { fontSize: 16 },
  typeOptionName: { fontSize: 13, color: colors.text, fontWeight: "600" },
  typeOptionNameActive: { color: "#FFF" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  submitBtn: { marginTop: spacing.lg, borderRadius: radii.full },
});
