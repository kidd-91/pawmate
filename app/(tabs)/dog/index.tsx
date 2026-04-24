import { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing, radii, shadows } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useExpenseStore } from "../../../stores/expenseStore";
import PawBackground from "../../../components/PawBackground";

const SIZE_LABELS: Record<string, string> = {
  small: "小型",
  medium: "中型",
  large: "大型",
};

const GENDER_LABELS: Record<string, string> = {
  male: "公",
  female: "母",
};

export default function DogIndexScreen() {
  const router = useRouter();
  const { myDog, fetchMyDog } = useAuthStore();
  const { summary, fetchSummary } = useExpenseStore();

  useFocusEffect(
    useCallback(() => {
      fetchMyDog();
      if (myDog) fetchSummary(myDog.id);
    }, [fetchMyDog, fetchSummary, myDog?.id])
  );

  const ageText = myDog
    ? myDog.age_months >= 12
      ? `${Math.floor(myDog.age_months / 12)} 歲`
      : `${myDog.age_months} 個月`
    : "";

  return (
    <View style={styles.container}>
      <PawBackground />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              fetchMyDog();
              if (myDog) fetchSummary(myDog.id);
            }}
          />
        }
      >
        {!myDog ? (
          <EmptyState onCreate={() => router.push("/(tabs)/profile")} />
        ) : (
          <>
            <DogSummaryCard
              dog={myDog}
              ageText={ageText}
              onEdit={() => router.push("/(tabs)/profile")}
            />

            <SectionPlaceholder
              icon="heart-pulse"
              title="健康紀錄"
              subtitle="疫苗、體重、用藥、看診都能在這裡記錄"
              tag="即將推出"
            />

            <ExpenseSection
              summary={summary}
              onOpen={() => router.push("/(tabs)/dog/expenses")}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DogSummaryCard({
  dog,
  ageText,
  onEdit,
}: {
  dog: any;
  ageText: string;
  onEdit: () => void;
}) {
  const photo = dog.photos?.[0];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons name="dog" size={36} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.cardHeaderText}>
          <Text style={styles.dogName}>{dog.name}</Text>
          <Text style={styles.dogMeta}>
            {dog.breed || "米克斯"} · {ageText} · {GENDER_LABELS[dog.gender] ?? ""}
            {SIZE_LABELS[dog.size] ? ` · ${SIZE_LABELS[dog.size]}` : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton} hitSlop={8}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {dog.bio ? (
        <Text style={styles.bio} numberOfLines={3}>
          {dog.bio}
        </Text>
      ) : null}

      {dog.personality?.length > 0 ? (
        <View style={styles.tagRow}>
          {dog.personality.slice(0, 6).map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ExpenseSection({
  summary,
  onOpen,
}: {
  summary: any;
  onOpen: () => void;
}) {
  const total = summary?.total ?? 0;
  const top = summary?.by_category?.[0];
  const monthLabel = summary
    ? `${summary.year}/${String(summary.month).padStart(2, "0")}`
    : `本月`;

  return (
    <TouchableOpacity style={styles.card} onPress={onOpen} activeOpacity={0.85}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>花費紀錄</Text>
          <Text style={styles.sectionSubtitle}>{monthLabel}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>本月總花費</Text>
          <Text style={styles.summaryValue}>NT$ {Math.round(total).toLocaleString()}</Text>
        </View>
        {top ? (
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>最大支出類別</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {top.icon ?? ""} {top.name}
            </Text>
            <Text style={styles.summarySubvalue}>
              NT$ {Math.round(top.total).toLocaleString()}
            </Text>
          </View>
        ) : (
          <View style={styles.summaryCell}>
            <Text style={styles.summaryHint}>還沒有紀錄，點開來新增</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function SectionPlaceholder({
  icon,
  title,
  subtitle,
  tag,
}: {
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
}) {
  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={28} color={colors.primary} />
      </View>
      <View style={styles.placeholderText}>
        <View style={styles.placeholderTitleRow}>
          <Text style={styles.placeholderTitle}>{title}</Text>
          <View style={styles.comingSoonTag}>
            <Text style={styles.comingSoonText}>{tag}</Text>
          </View>
        </View>
        <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🐶</Text>
      <Text style={styles.emptyTitle}>還沒有狗狗檔案</Text>
      <Text style={styles.emptySubtitle}>
        建立檔案後，這裡會顯示你家寶貝的所有資訊
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onCreate}>
        <Text style={styles.emptyButtonText}>去建立檔案</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.border },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  cardHeaderText: { flex: 1 },
  dogName: { fontSize: 20, fontWeight: "700", color: colors.text },
  dogMeta: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
  editButton: {
    padding: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,140,105,0.1)",
  },
  bio: { marginTop: spacing.md, fontSize: 14, color: colors.text, lineHeight: 20 },
  tagRow: { marginTop: spacing.md, flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,140,105,0.12)",
  },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: "600" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,140,105,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  sectionSubtitle: { marginTop: 2, fontSize: 12, color: colors.textSecondary },

  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  summaryCell: {
    flex: 1,
    padding: spacing.sm + 2,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
  },
  summaryLabel: { fontSize: 11, color: colors.textSecondary },
  summaryValue: { marginTop: 2, fontSize: 16, fontWeight: "700", color: colors.text },
  summarySubvalue: { marginTop: 2, fontSize: 12, color: colors.textSecondary },
  summaryHint: { fontSize: 13, color: colors.textSecondary },

  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  placeholderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,140,105,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { flex: 1 },
  placeholderTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  placeholderTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  comingSoonTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  comingSoonText: { fontSize: 10, color: colors.textSecondary, fontWeight: "600" },
  placeholderSubtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  emptySubtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  emptyButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
