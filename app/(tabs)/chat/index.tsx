import { useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useMatchStore } from "../../../stores/matchStore";
import { useChatStore } from "../../../stores/chatStore";
import PawBackground from "../../../components/PawBackground";
import type { Match } from "../../../types";

export default function ChatListScreen() {
  const { myDog } = useAuthStore();
  const { matches, fetchMatches } = useMatchStore();
  const { lastMessages, fetchLastMessages } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    if (myDog) fetchMatches(myDog.id);
  }, [myDog]);

  // Re-fetch when tab gains focus
  useFocusEffect(
    useCallback(() => {
      if (myDog) fetchMatches(myDog.id);
    }, [myDog])
  );

  useEffect(() => {
    if (matches.length > 0) {
      fetchLastMessages(matches.map((m) => m.id));
    }
  }, [matches]);

  const [refreshing, setRefreshing] = [false, () => {}];
  const onRefresh = useCallback(async () => {
    if (myDog) {
      await fetchMatches(myDog.id);
    }
  }, [myDog]);

  const getOtherDog = (match: Match) => {
    if (!myDog) return match.dog_a;
    return match.dog_a_id === myDog.id ? match.dog_b : match.dog_a;
  };

  // Deduplicate matches by the other dog's id
  const seen = new Set<string>();
  const uniqueMatches = matches.filter((m) => {
    const otherDogId = myDog
      ? (m.dog_a_id === myDog.id ? m.dog_b_id : m.dog_a_id)
      : m.dog_a_id;
    if (seen.has(otherDogId)) return false;
    seen.add(otherDogId);
    return true;
  });

  // Sort by last message time (most recent first)
  const sortedMatches = [...uniqueMatches].sort((a, b) => {
    const aMsg = lastMessages[a.id];
    const bMsg = lastMessages[b.id];
    if (aMsg && bMsg) return new Date(bMsg.created_at).getTime() - new Date(aMsg.created_at).getTime();
    if (aMsg) return -1;
    if (bMsg) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (sortedMatches.length === 0) {
    return (
      <View style={styles.empty}>
        <PawBackground />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>還沒有聊天</Text>
          <Text style={styles.emptyText}>配對成功後就可以開始聊天囉！</Text>
          <View style={styles.emptySteps}>
            <View style={styles.emptyStep}>
              <Text style={styles.stepNum}>1</Text>
              <Text style={styles.stepText}>探索狗狗</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.textSecondary} />
            <View style={styles.emptyStep}>
              <Text style={styles.stepNum}>2</Text>
              <Text style={styles.stepText}>互相喜歡</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.textSecondary} />
            <View style={styles.emptyStep}>
              <Text style={styles.stepNum}>3</Text>
              <Text style={styles.stepText}>開始聊天</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
    } else if (diff < oneDay * 2) {
      return "昨天";
    } else if (diff < oneDay * 7) {
      const days = ["日", "一", "二", "三", "四", "五", "六"];
      return `週${days[date.getDay()]}`;
    } else {
      return date.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
    }
  };

  return (
    <View style={styles.container}>
      <PawBackground />
      <FlatList
        data={sortedMatches}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => {
          const otherDog = getOtherDog(item);
          if (!otherDog) return null;
          const lastMsg = lastMessages[item.id];

          return (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={
                    otherDog.photos?.length > 0
                      ? { uri: otherDog.photos[0] }
                      : require("../../../assets/icon.png")
                  }
                  style={styles.avatar}
                />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.topRow}>
                  <Text style={styles.dogName} numberOfLines={1}>{otherDog.name}</Text>
                  {lastMsg && (
                    <Text style={styles.timeText}>{formatTime(lastMsg.created_at)}</Text>
                  )}
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {lastMsg ? lastMsg.content : `${otherDog.breed} · 點擊開始聊天`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: 3,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255,140,105,0.15)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  chatInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dogName: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },
  separator: {
    height: 4,
  },
  empty: {
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
    marginHorizontal: spacing.md,
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
    marginTop: spacing.sm,
    textAlign: "center",
  },
  emptySteps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,140,105,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  emptyStep: {
    alignItems: "center",
    gap: 2,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 20,
    overflow: "hidden",
  },
  stepText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
