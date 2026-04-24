import { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { colors, spacing, radii, shadows } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import SwipeDeck from "../../components/SwipeDeck";
import NearbyDogsList from "../../components/NearbyDogsList";

type ExploreMode = "swipe" | "nearby";

export default function ExploreScreen() {
  const { myDog } = useAuthStore();
  const { likesYou, fetchLikesYou } = useMatchStore();
  const router = useRouter();
  const [mode, setMode] = useState<ExploreMode>("swipe");

  useFocusEffect(
    useCallback(() => {
      if (myDog) fetchLikesYou(myDog.id);
    }, [myDog, fetchLikesYou])
  );

  return (
    <View style={styles.container}>
      {likesYou.length > 0 ? (
        <TouchableOpacity
          style={styles.likesBanner}
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/likes-you")}
        >
          <View style={styles.likesIconWrap}>
            <Text style={styles.likesEmoji}>💕</Text>
          </View>
          <View style={styles.likesTextWrap}>
            <Text style={styles.likesTitle}>{likesYou.length} 個人喜歡你</Text>
            <Text style={styles.likesSubtitle}>點開來看是誰，回喜歡就配對成功！</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.modeBar}>
        <ModeButton
          label="滑卡"
          icon="cards-outline"
          active={mode === "swipe"}
          onPress={() => setMode("swipe")}
        />
        <ModeButton
          label="附近"
          icon="map-marker-outline"
          active={mode === "nearby"}
          onPress={() => setMode("nearby")}
        />
      </View>

      <View style={styles.content}>
        {mode === "swipe" ? <SwipeDeck /> : <NearbyDogsList />}
      </View>
    </View>
  );
}

function ModeButton({
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
      style={[styles.modeButton, active && styles.modeButtonActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={active ? "#FFF" : colors.textSecondary}
      />
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  likesBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.2)",
    ...shadows.card,
  },
  likesIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,107,107,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  likesEmoji: { fontSize: 22 },
  likesTextWrap: { flex: 1 },
  likesTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  likesSubtitle: { marginTop: 2, fontSize: 12, color: colors.textSecondary },
  modeBar: {
    flexDirection: "row",
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  modeButtonTextActive: { color: "#FFF" },
  content: { flex: 1, marginTop: spacing.sm },
});
