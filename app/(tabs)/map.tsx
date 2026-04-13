import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { Text, Chip, Card } from "react-native-paper";
import * as Location from "expo-location";
import { colors, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import type { Dog } from "../../types";

interface NearbyDog extends Omit<Dog, "owner"> {
  owner?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
  };
}

export default function MapScreen() {
  const { session } = useAuthStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyDogs, setNearbyDogs] = useState<NearbyDog[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("需要位置權限才能顯示附近的狗狗");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      if (session?.user?.id) {
        await supabase
          .from("profiles")
          .update({
            location: `POINT(${loc.coords.longitude} ${loc.coords.latitude})`,
          })
          .eq("id", session.user.id);
      }

      fetchNearbyDogs(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchNearbyDogs = async (lat: number, lng: number) => {
    const { data } = await supabase.rpc("get_nearby_dogs", {
      user_lat: lat,
      user_lng: lng,
      radius_km: 10,
    });
    if (data) setNearbyDogs(data);
  };

  if (errorMsg) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyTitle}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyTitle}>取得位置中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.webHeader}>
        <Chip icon="map-marker-radius" style={styles.radiusChip}>
          附近 10 公里內 · {nearbyDogs.length} 隻狗狗
        </Chip>
      </View>
      {nearbyDogs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🐕</Text>
          <Text style={styles.emptyTitle}>附近暫時沒有狗狗</Text>
        </View>
      ) : (
        <FlatList
          data={nearbyDogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.listCard}>
              <Card.Content style={styles.listCardContent}>
                <Image
                  source={
                    item.photos.length > 0
                      ? { uri: item.photos[0] }
                      : require("../../assets/icon.png")
                  }
                  style={styles.listAvatar}
                />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{item.name}</Text>
                  <Text style={styles.listBreed}>{item.breed}</Text>
                  <View style={styles.listTags}>
                    {item.personality.slice(0, 3).map((p) => (
                      <Chip
                        key={p}
                        compact
                        style={styles.listChip}
                        textStyle={{ fontSize: 11 }}
                      >
                        {p}
                      </Chip>
                    ))}
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  webHeader: { padding: spacing.md, alignItems: "center" },
  radiusChip: { backgroundColor: colors.surface, elevation: 2 },
  listContent: { padding: spacing.md, gap: spacing.sm },
  listCard: { backgroundColor: colors.card, borderRadius: 16 },
  listCardContent: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  listAvatar: { width: 64, height: 64, borderRadius: 32 },
  listInfo: { flex: 1 },
  listName: { fontSize: 18, fontWeight: "bold", color: colors.text },
  listBreed: { fontSize: 14, color: colors.textSecondary },
  listTags: { flexDirection: "row", gap: 4, marginTop: 6 },
  listChip: { height: 26 },
});
