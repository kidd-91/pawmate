import { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing, radii, shadows } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import PawBackground from "../../components/PawBackground";

export default function LikesYouScreen() {
  const router = useRouter();
  const { myDog } = useAuthStore();
  const { likesYou, fetchLikesYou, swipe } = useMatchStore();
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      if (myDog) fetchLikesYou(myDog.id);
    }, [myDog, fetchLikesYou])
  );

  const onRefresh = useCallback(async () => {
    if (!myDog) return;
    setRefreshing(true);
    await fetchLikesYou(myDog.id);
    setRefreshing(false);
  }, [myDog, fetchLikesYou]);

  const respond = async (targetDogId: string, direction: "like" | "pass") => {
    if (!myDog || acting.has(targetDogId)) return;
    setActing((prev) => new Set(prev).add(targetDogId));
    const match = await swipe(myDog.id, targetDogId, direction);
    if (direction === "like" && match) {
      Alert.alert("配對成功！🎉", "你們互相喜歡！可以開始聊天了", [
        { text: "去聊天", onPress: () => router.push("/(tabs)/chat") },
        { text: "繼續看", style: "cancel" },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <PawBackground />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>喜歡你的狗狗</Text>
        <View style={styles.backBtn} />
      </View>

      {likesYou.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>還沒有人按你愛心</Text>
            <Text style={styles.emptyText}>
              繼續去探索頁面找新狗友！{"\n"}
              當有人按你愛心，會在這裡顯示。
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={likesYou}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => {
            const ageText =
              item.age_months >= 12
                ? `${Math.floor(item.age_months / 12)} 歲`
                : `${item.age_months} 個月`;
            const isActing = acting.has(item.id);

            return (
              <View style={styles.card}>
                <LinearGradient
                  colors={["rgba(255,107,107,0.08)", "rgba(255,140,105,0.04)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />

                <TouchableOpacity
                  style={styles.cardMain}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/(tabs)/dog/${item.id}?from=likes-you`)}
                >
                  <Image
                    source={
                      item.photos?.length
                        ? { uri: item.photos[0] }
                        : require("../../assets/icon.png")
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={styles.dogName}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.breed || "米克斯"} · {ageText} ·{" "}
                      {item.gender === "male" ? "♂" : "♀"}
                    </Text>
                    {item.personality?.length > 0 ? (
                      <View style={styles.tags}>
                        {item.personality.slice(0, 3).map((tag) => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.passBtn, isActing && styles.btnDisabled]}
                    disabled={isActing}
                    onPress={() => respond(item.id, "pass")}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.likeBtn, isActing && styles.btnDisabled]}
                    disabled={isActing}
                    onPress={() => respond(item.id, "like")}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="heart" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    overflow: "hidden",
    ...shadows.card,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,107,107,0.25)",
  },
  info: { flex: 1 },
  dogName: { fontSize: 17, fontWeight: "700", color: colors.text },
  meta: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
  tags: { flexDirection: "row", gap: 4, marginTop: 6 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,140,105,0.12)",
  },
  tagText: { fontSize: 11, color: colors.primary, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  passBtn: { backgroundColor: colors.pass },
  likeBtn: { backgroundColor: colors.like },
  btnDisabled: { opacity: 0.5 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.card,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
