import { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter, useFocusEffect } from "expo-router";
import { Alert } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import PawBackground from "../../components/PawBackground";

interface NearbyDog {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  age_months: number;
  gender: string;
  size: string;
  personality: string[];
  bio: string;
  city: string;
  district: string;
  photos: string[];
  is_active: boolean;
  created_at: string;
  distance_km?: number;
  owner_name: string;
}

const RADIUS_OPTIONS = [3, 5, 10, 20];

export default function MapScreen() {
  const { session, myDog } = useAuthStore();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyDogs, setNearbyDogs] = useState<NearbyDog[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);

  const initLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("需要位置權限才能顯示附近的狗狗");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Update user location via backend API
      if (session?.user?.id) {
        await api.post("/api/map/update-location", {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        }).catch(() => {});
      }

      await fetchNearbyDogs(loc.coords.latitude, loc.coords.longitude, radius);
    } catch (e) {
      setErrorMsg("無法取得位置");
    }
    setLoading(false);
  };

  useEffect(() => {
    initLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (location) {
        fetchNearbyDogs(location.coords.latitude, location.coords.longitude, radius);
      }
    }, [location, radius])
  );

  const fetchNearbyDogs = async (lat: number, lng: number, r: number) => {
    try {
      const data = await api.get<NearbyDog[]>(
        `/api/map/nearby-dogs?lat=${lat}&lng=${lng}&radius_km=${r}`
      );
      if (data) {
        const filtered = myDog
          ? data.filter((d) => d.id !== myDog.id)
          : data;
        setNearbyDogs(filtered);
      }
    } catch {}
  };

  const handleRadiusChange = async (r: number) => {
    setRadius(r);
    if (location) {
      await fetchNearbyDogs(location.coords.latitude, location.coords.longitude, r);
    }
  };

  const onRefresh = async () => {
    if (location) {
      setLoading(true);
      await fetchNearbyDogs(location.coords.latitude, location.coords.longitude, radius);
      setLoading(false);
    }
  };

  const formatDistance = (km: number | undefined | null) => {
    if (km == null) return null;
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  const { swipe } = useMatchStore();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleLike = async (targetDogId: string) => {
    if (!myDog) return;
    setLikedIds((prev) => new Set(prev).add(targetDogId));
    const match = await swipe(myDog.id, targetDogId, "like");
    if (match) {
      Alert.alert("配對成功！🎉", "你們互相喜歡！可以開始聊天了");
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.emptyContainer}>
        <PawBackground />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>{errorMsg}</Text>
          <Text style={styles.emptyText}>請在設定中允許位置權限後重試</Text>
        </View>
      </View>
    );
  }

  if (!location && loading) {
    return (
      <View style={styles.emptyContainer}>
        <PawBackground />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>取得位置中...</Text>
          <Text style={styles.emptyText}>正在搜尋你附近的狗狗朋友</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PawBackground />

      {/* Radius selector */}
      <View style={styles.radiusBar}>
        <MaterialCommunityIcons name="map-marker-radius" size={18} color={colors.primary} />
        <Text style={styles.radiusLabel}>搜尋範圍：</Text>
        {RADIUS_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
            onPress={() => handleRadiusChange(r)}
          >
            <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>
              {r}km
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          附近 {radius} 公里內找到 {nearbyDogs.length} 隻狗狗
        </Text>
      </View>

      {nearbyDogs.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyTitle}>附近暫時沒有狗狗</Text>
            <Text style={styles.emptyText}>試試擴大搜尋範圍吧！</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={nearbyDogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const ageText =
              item.age_months >= 12
                ? `${Math.floor(item.age_months / 12)} 歲`
                : `${item.age_months} 個月`;

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/dog/${item.id}?from=map`)}
              >
                <LinearGradient
                  colors={["rgba(255,140,105,0.06)", "rgba(255,209,102,0.04)"]}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                <Image
                  source={
                    item.photos?.length > 0
                      ? { uri: item.photos[0] }
                      : require("../../assets/icon.png")
                  }
                  style={styles.avatar}
                />

                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.dogName}>{item.name}</Text>
                    {formatDistance(item.distance_km) && (
                      <View style={styles.distanceBadge}>
                        <MaterialCommunityIcons name="map-marker" size={12} color={colors.primary} />
                        <Text style={styles.distanceText}>{formatDistance(item.distance_km)}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.breed}>
                    {item.breed} · {ageText} · {item.gender === "male" ? "♂" : "♀"}
                  </Text>

                  {item.personality.length > 0 && (
                    <View style={styles.tags}>
                      {item.personality.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    {item.city ? (
                      <Text style={styles.locationText}>
                        📍 {item.city}{item.district ? ` ${item.district}` : ""}
                      </Text>
                    ) : null}
                    {item.owner_name ? (
                      <Text style={styles.ownerText}>主人：{item.owner_name}</Text>
                    ) : null}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.likeBtn, likedIds.has(item.id) && styles.likeBtnActive]}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (!likedIds.has(item.id)) handleLike(item.id);
                  }}
                  disabled={likedIds.has(item.id)}
                >
                  <MaterialCommunityIcons
                    name={likedIds.has(item.id) ? "heart" : "heart-outline"}
                    size={22}
                    color={likedIds.has(item.id) ? "#FFF" : colors.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Radius bar
  radiusBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  radiusLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 2,
  },
  radiusChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  radiusChipTextActive: {
    color: "#FFF",
  },
  // Count
  countBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // List
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: "hidden",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,140,105,0.15)",
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dogName: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,140,105,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  breed: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tags: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: "rgba(255,209,102,0.3)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: colors.text,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ownerText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  likeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,140,105,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  likeBtnActive: {
    backgroundColor: colors.primary,
  },
  // Empty states
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
