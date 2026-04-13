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
import { colors, spacing } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import type { Match } from "../../types";

export default function MatchesScreen() {
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
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const otherDog = getOtherDog(item);
          if (!otherDog) return null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
            >
              <Image
                source={
                  otherDog.photos?.length > 0
                    ? { uri: otherDog.photos[0] }
                    : require("../../assets/icon.png")
                }
                style={styles.avatar}
              />
              <Text style={styles.dogName}>{otherDog.name}</Text>
              <Text style={styles.breed}>{otherDog.breed}</Text>
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
  },
  card: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.md,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.sm,
  },
  dogName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  breed: {
    fontSize: 14,
    color: colors.textSecondary,
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
