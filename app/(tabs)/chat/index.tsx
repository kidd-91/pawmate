import { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../../constants/theme";
import { useAuthStore } from "../../../stores/authStore";
import { useMatchStore } from "../../../stores/matchStore";
import type { Match } from "../../../types";

export default function ChatListScreen() {
  const { myDog } = useAuthStore();
  const { matches, fetchMatches } = useMatchStore();
  const router = useRouter();

  useEffect(() => {
    if (myDog) fetchMatches(myDog.id);
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

  if (uniqueMatches.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>還沒有聊天</Text>
        <Text style={styles.emptyText}>配對成功後就可以開始聊天囉！</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={uniqueMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherDog = getOtherDog(item);
          if (!otherDog) return null;

          return (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
            >
              <Image
                source={
                  otherDog.photos?.length > 0
                    ? { uri: otherDog.photos[0] }
                    : require("../../../assets/icon.png")
                }
                style={styles.avatar}
              />
              <View style={styles.chatInfo}>
                <Text style={styles.dogName}>{otherDog.name}</Text>
                <Text style={styles.lastMessage}>
                  {otherDog.breed} · 點擊開始聊天
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
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56 + spacing.md * 2,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
