import { useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
} from "react-native";
import { Text, Modal, Portal, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { confirmAction } from "../../../lib/confirm";
import { colors, spacing, radii, shadows } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useExpenseStore } from "../../../stores/expenseStore";
import PawBackground from "../../../components/PawBackground";
import type { DogExpense, ExpenseCategory } from "../../../types";

export default function ExpensesScreen() {
  const router = useRouter();
  const { myDog } = useAuthStore();
  const {
    expenses,
    categories,
    summary,
    fetchExpenses,
    fetchCategories,
    fetchSummary,
    deleteExpense,
  } = useExpenseStore();

  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const monthRange = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { from, to, year: y, month: m };
  }, []);

  const refresh = useCallback(async () => {
    if (!myDog) return;
    await Promise.all([
      fetchExpenses(myDog.id, { from: monthRange.from, to: monthRange.to }),
      fetchSummary(myDog.id, monthRange.year, monthRange.month),
      fetchCategories(),
    ]);
  }, [myDog, monthRange, fetchExpenses, fetchSummary, fetchCategories]);

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

  const handleDelete = (e: DogExpense) => {
    confirmAction({
      title: "刪除這筆花費？",
      message: `${e.category?.name ?? "分類"} · NT$ ${Math.round(Number(e.amount)).toLocaleString()}`,
      confirmText: "刪除",
      destructive: true,
      onConfirm: async () => {
        const ok = await deleteExpense(e.id);
        if (ok) refresh();
      },
    });
  };

  return (
    <View style={styles.container}>
      <PawBackground />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/dog")}
          hitSlop={8}
          style={styles.headerBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{monthRange.year}/{String(monthRange.month).padStart(2, "0")} 花費</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>本月總花費</Text>
        <Text style={styles.totalValue}>
          NT$ {Math.round(summary?.total ?? 0).toLocaleString()}
        </Text>
        {summary && summary.by_category.length > 0 ? (
          <View style={styles.categoryRow}>
            {summary.by_category.slice(0, 4).map((c) => (
              <View key={c.id} style={styles.catChip}>
                <Text style={styles.catChipIcon}>{c.icon ?? "📦"}</Text>
                <View>
                  <Text style={styles.catChipName}>{c.name}</Text>
                  <Text style={styles.catChipAmt}>
                    NT$ {Math.round(c.total).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>💸</Text>
            <Text style={styles.emptyTitle}>本月還沒有花費紀錄</Text>
            <Text style={styles.emptyText}>點右下角 + 新增第一筆</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ExpenseRow expense={item} onDelete={() => handleDelete(item)} />
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

      <ExpenseFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        dogId={myDog?.id ?? ""}
        onCreated={() => {
          setShowForm(false);
          refresh();
        }}
      />
    </View>
  );
}

function ExpenseRow({
  expense,
  onDelete,
}: {
  expense: DogExpense;
  onDelete: () => void;
}) {
  const amount = Number(expense.amount) * Number(expense.share_ratio ?? 1);
  return (
    <View style={styles.expenseRow}>
      <View
        style={[
          styles.expenseIconWrap,
          { backgroundColor: expense.category?.color ? `${expense.category.color}22` : "rgba(255,140,105,0.1)" },
        ]}
      >
        <Text style={styles.expenseIcon}>{expense.category?.icon ?? "📦"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expenseTitle}>{expense.category?.name ?? "未分類"}</Text>
        {expense.notes ? (
          <Text style={styles.expenseNotes} numberOfLines={1}>
            {expense.notes}
          </Text>
        ) : null}
        <Text style={styles.expenseDate}>
          {expense.spent_at}
          {expense.merchant ? ` · ${expense.merchant}` : ""}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>
        NT$ {Math.round(amount).toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={onDelete}
        hitSlop={8}
        style={styles.deleteBtn}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

function ExpenseFormModal({
  visible,
  onClose,
  categories,
  dogId,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  dogId: string;
  onCreated: () => void;
}) {
  const { createExpense } = useExpenseStore();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [merchant, setMerchant] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCategoryId(null);
    setAmount("");
    setNotes("");
    setMerchant("");
  };

  const submit = async () => {
    if (!categoryId) {
      Alert.alert("請選類別");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("請輸入有效金額");
      return;
    }
    if (!dogId) {
      Alert.alert("沒有狗狗資料");
      return;
    }

    setSubmitting(true);
    const created = await createExpense({
      category_id: categoryId,
      amount: amt,
      notes,
      merchant: merchant || undefined,
      dog_ids: [dogId],
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
            <Text style={styles.modalTitle}>新增花費</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.formLabel}>類別</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
          >
            {categories.map((c) => {
              const active = c.id === categoryId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catOption, active && styles.catOptionActive]}
                  onPress={() => setCategoryId(c.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.catOptionIcon}>{c.icon ?? "📦"}</Text>
                  <Text style={[styles.catOptionName, active && styles.catOptionNameActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.formLabel}>金額 (NT$)</Text>
          <RNTextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.formLabel}>商家（選填）</Text>
          <RNTextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="例：寵物店、獸醫院"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.formLabel}>備註（選填）</Text>
          <RNTextInput
            style={[styles.input, { height: 60, textAlignVertical: "top" }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="買了什麼、看了哪個獸醫等"
            multiline
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

  totalCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    ...shadows.card,
  },
  totalLabel: { fontSize: 12, color: colors.textSecondary },
  totalValue: { marginTop: 4, fontSize: 28, fontWeight: "800", color: colors.primary },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.md },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
  },
  catChipIcon: { fontSize: 16 },
  catChipName: { fontSize: 11, color: colors.text, fontWeight: "600" },
  catChipAmt: { fontSize: 11, color: colors.textSecondary },

  list: { padding: spacing.md, paddingBottom: 120 },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    ...shadows.card,
  },
  expenseIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseIcon: { fontSize: 20 },
  expenseTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  expenseNotes: { marginTop: 2, fontSize: 12, color: colors.text },
  expenseDate: { marginTop: 2, fontSize: 11, color: colors.textSecondary },
  expenseAmount: { fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: spacing.sm },
  deleteBtn: {
    padding: spacing.sm,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },

  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
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
  catScroll: { gap: spacing.xs, paddingVertical: spacing.xs },
  catOption: {
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
  catOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catOptionIcon: { fontSize: 16 },
  catOptionName: { fontSize: 13, color: colors.text, fontWeight: "600" },
  catOptionNameActive: { color: "#FFF" },
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
