import { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text, Chip } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, spacing } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import { MatchCardSkeleton } from "../../components/Skeleton";
import PawBackground from "../../components/PawBackground";
import type { Match, Dog } from "../../types";

export default function MatchesScreen() {
  const { myDog } = useAuthStore();
  const { matches, fetchMatches } = useMatchStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch on mount and whenever myDog changes
  useEffect(() => {
    if (myDog) {
      fetchMatches(myDog.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [myDog]);

  // Re-fetch when tab gains focus
  useFocusEffect(
    useCallback(() => {
      if (myDog) fetchMatches(myDog.id);
    }, [myDog])
  );

  const onRefresh = useCallback(async () => {
    if (!myDog) return;
    setRefreshing(true);
    await fetchMatches(myDog.id);
    setRefreshing(false);
  }, [myDog]);

  const getOtherDog = (match: Match): Dog | undefined => {
    if (!myDog) return match.dog_a;
    return match.dog_a_id === myDog.id ? match.dog_b : match.dog_a;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PawBackground />
        <View style={styles.list}>
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </View>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.empty}>
        <PawBackground />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>還沒有好友</Text>
          <Text style={styles.emptyText}>去「探索」頁面滑動{"\n"}互相喜歡就能成為好友！</Text>
          <View style={styles.emptyHintRow}>
            <MaterialCommunityIcons name="gesture-swipe-right" size={20} color={colors.primary} />
            <Text style={styles.emptyHint}>右滑 = 喜歡</Text>
            <MaterialCommunityIcons name="gesture-swipe-left" size={20} color={colors.pass} />
            <Text style={styles.emptyHint}>左滑 = 跳過</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PawBackground />
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {matches.length} 位好友 💕
          </Text>
        }
        renderItem={({ item }) => {
          const otherDog = getOtherDog(item);
          if (!otherDog) return null;

          const ageText =
            otherDog.age_months >= 12
              ? `${Math.floor(otherDog.age_months / 12)} 歲`
              : `${otherDog.age_months} 個月`;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/dog/${otherDog.id}`)}
            >
              <LinearGradient
                colors={["rgba(255,140,105,0.08)", "rgba(255,209,102,0.05)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              />
              <View style={styles.avatarFrame}>
                <Image
                  source={
                    otherDog.photos?.length > 0
                      ? { uri: otherDog.photos[0] }
                      : require("../../assets/icon.png")
                  }
                  style={styles.avatar}
                />
                <View style={styles.genderBadge}>
                  <Text style={styles.genderText}>
                    {otherDog.gender === "male" ? "♂" : "♀"}
                  </Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.dogName}>{otherDog.name}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                </View>
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
                <View style={styles.cardFooter}>
                  {otherDog.city ? (
                    <View style={styles.locationBadge}>
                      <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
                      <Text style={styles.locationText}>{otherDog.city}{otherDog.district ? ` ${otherDog.district}` : ""}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.matchDate}>
                    💕 {new Date(item.created_at).toLocaleDateString("zh-TW")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
    paddingBottom: spacing.xl,
  },
  listHeader: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    gap: spacing.md,
    overflow: "hidden",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarFrame: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,140,105,0.2)",
  },
  genderBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  genderText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold",
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dogName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  breed: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: "rgba(255,209,102,0.3)",
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: colors.text,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  locationText: {
    fontSize: 11,
    color: colors.primary,
  },
  matchDate: {
    fontSize: 11,
    color: colors.textSecondary,
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
    lineHeight: 22,
  },
  emptyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,140,105,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
});
