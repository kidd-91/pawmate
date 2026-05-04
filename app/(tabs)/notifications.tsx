import { useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing, radii, shadows } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import { useHealthStore } from "../../stores/healthStore";
import PawBackground from "../../components/PawBackground";

interface NotificationItem {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  // sort key: lower = more urgent
  urgency: number;
  onPress: () => void;
  // health reminders only — null for likes-you
  recordId?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { myDog } = useAuthStore();
  const { likesYou, fetchLikesYou } = useMatchStore();
  const { reminders, fetchReminders, dismissReminder } = useHealthStore();

  const refresh = useCallback(async () => {
    if (myDog) await fetchLikesYou(myDog.id);
    await fetchReminders(30);
  }, [myDog, fetchLikesYou, fetchReminders]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    if (likesYou.length > 0) {
      items.push({
        id: "likes-you",
        icon: "💕",
        iconColor: colors.like,
        iconBg: "rgba(255,107,107,0.12)",
        title: `${likesYou.length} 個人喜歡你`,
        subtitle: "點開來看是誰，回喜歡就配對成功",
        urgency: 1,
        onPress: () => router.push("/(tabs)/likes-you"),
      });
    }

    reminders.forEach((r) => {
      const urgent = r.days_until <= 7;
      const overdue = r.days_until < 0;
      items.push({
        id: `reminder-${r.record_id}`,
        icon: urgent ? "⏰" : "📅",
        iconColor: urgent ? colors.like : colors.primary,
        iconBg: urgent ? "rgba(255,107,107,0.12)" : "rgba(255,140,105,0.12)",
        title: `${r.dog_name} 的 ${r.type_label}${r.title ? ` · ${r.title}` : ""}`,
        subtitle:
          overdue
            ? `已過 ${-r.days_until} 天 (${r.next_due_at})`
            : r.days_until === 0
            ? "今天到期"
            : r.days_until === 1
            ? "明天到期"
            : `${r.days_until} 天後到期 (${r.next_due_at})`,
        urgency: urgent ? 0 : 2,
        onPress: () => router.push("/(tabs)/dog/health"),
        recordId: r.record_id,
      });
    });

    items.sort((a, b) => a.urgency - b.urgency);
    return items;
  }, [likesYou, reminders, router]);

  return (
    <View style={styles.container}>
      <PawBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>通知</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>目前沒有通知</Text>
            <Text style={styles.emptyText}>
              有人按你愛心、健康提醒到期時{"\n"}會在這裡顯示
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            {item.recordId ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  dismissReminder(item.recordId!);
                }}
                hitSlop={8}
                style={styles.dismissBtn}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ) : (
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
      />
    </View>
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    ...shadows.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  rowSubtitle: { marginTop: 2, fontSize: 12, color: colors.textSecondary },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  dismissBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.background,
  },
});
