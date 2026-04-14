import { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Text, Chip } from "react-native-paper";
import { colors, spacing } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import type { Match, Dog } from "../../types";

export default function MatchesScreen() {
  const { myDog } = useAuthStore();
  const { matches, fetchMatches } = useMatchStore();

  useEffect(() => {
    if (myDog) fetchMatches(myDog.id);
  }, [myDog]);

  const getOtherDog = (match: Match): Dog | undefined => {
    if (!myDog) return match.dog_a;
    return match.dog_a_id === myDog.id ? match.dog_b : match.dog_a;
  };

  if (matches.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💝</Text>
        <Text style={styles.emptyTitle}>還沒有配對</Text>
        <Text style={styles.emptyText}>去「探索」頁面滑動找到喜歡的狗狗吧！</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const otherDog = getOtherDog(item);
          if (!otherDog) return null;

          const ageText =
            otherDog.age_months >= 12
              ? `${Math.floor(otherDog.age_months / 12)} 歲`
              : `${otherDog.age_months} 個月`;

          return (
            <View style={styles.card}>
              <Image
                source={
                  otherDog.photos?.length > 0
                    ? { uri: otherDog.photos[0] }
                    : require("../../assets/icon.png")
                }
                style={styles.avatar}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.dogName}>{otherDog.name}</Text>
                <Text style={styles.breed}>{otherDog.breed} · {ageText}</Text>
                {otherDog.personality.length > 0 && (
                  <View style={styles.tags}>
                    {otherDog.personality.slice(0, 3).map((tag) => (
                      <Chip key={tag} compact style={styles.tag} textStyle={styles.tagText}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                )}
                {otherDog.owner && (
                  <Text style={styles.ownerName}>主人：{otherDog.owner.display_name}</Text>
                )}
                <Text style={styles.matchDate}>
                  配對於 {new Date(item.created_at).toLocaleDateString("zh-TW")}
                </Text>
              </View>
            </View>
          );
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
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  dogName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  breed: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: colors.text,
  },
  ownerName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  matchDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
