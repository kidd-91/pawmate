import { useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, Button, FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useWalkGroupStore } from "../../../stores/walkGroupStore";
import { useAuthStore } from "../../../stores/authStore";
import PawBackground from "../../../components/PawBackground";
import type { WalkGroup } from "../../../types";

const TIME_LABELS: Record<string, string> = {
  morning: "🌅 早上",
  afternoon: "☀️ 下午",
  evening: "🌙 晚上",
};

export default function WalksScreen() {
  const { groups, fetchGroups, loading } = useWalkGroupStore();
  const { session, myDog, fetchMyDog } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (session && !myDog) fetchMyDog();
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return "今天";
    if (date.toDateString() === tomorrow.toDateString()) return "明天";

    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getMonth() + 1}/${date.getDate()} 週${days[date.getDay()]}`;
  };

  if (groups.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <PawBackground />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🐕‍🦺</Text>
          <Text style={styles.emptyTitle}>還沒有揪團</Text>
          <Text style={styles.emptyText}>發起一個遛狗揪團{"\n"}找附近的狗友一起出門吧！</Text>
          <Button
            mode="contained"
            buttonColor={colors.primary}
            onPress={() => {
              if (myDog) {
                router.push("/(tabs)/walks/create");
              } else {
                Alert.alert("尚未建立檔案", "請先到「我的」頁面建立狗狗檔案");
              }
            }}
            style={styles.emptyBtn}
            icon="plus"
          >
            發起揪團
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PawBackground />
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchGroups}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/walks/${item.id}`)}
          >
            <LinearGradient
              colors={["rgba(255,140,105,0.06)", "rgba(255,209,102,0.04)"]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.cardHeader}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{formatDate(item.walk_date)}</Text>
              </View>
              <Text style={styles.timeBadge}>{TIME_LABELS[item.walk_time] || item.walk_time}</Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>

            <View style={styles.cardDetailRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
              <Text style={styles.cardDetail}>{item.location}</Text>
            </View>

            {item.notes ? (
              <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text>
            ) : null}

            <View style={styles.cardFooter}>
              <View style={styles.creatorRow}>
                {item.creator_dog?.photos?.[0] ? (
                  <Image source={{ uri: item.creator_dog.photos[0] }} style={styles.creatorAvatar} />
                ) : (
                  <View style={styles.creatorAvatarPlaceholder}>
                    <Text style={{ fontSize: 14 }}>🐶</Text>
                  </View>
                )}
                <Text style={styles.creatorName}>{item.creator_dog?.name} 發起</Text>
              </View>

              <View style={styles.memberBadge}>
                <MaterialCommunityIcons name="account-group" size={16} color={colors.primary} />
                <Text style={styles.memberCount}>
                  {item.member_count ?? 1}/{item.max_members}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFF"
        onPress={() => {
          if (myDog) {
            router.push("/(tabs)/walks/create");
          } else {
            Alert.alert("尚未建立檔案", "請先到「我的」頁面建立狗狗檔案");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  timeBadge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  cardDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  creatorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  creatorAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,140,105,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  creatorName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,140,105,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 28,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  emptyBtn: {
    borderRadius: 25,
    marginTop: spacing.lg,
  },
});
