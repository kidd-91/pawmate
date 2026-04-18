import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../../../constants/theme";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../stores/authStore";
import { useMatchStore } from "../../../stores/matchStore";
import type { Dog, Match } from "../../../types";

const { width } = Dimensions.get("window");

type RelationStatus = "none" | "liked" | "matched";

export default function DogProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myDog } = useAuthStore();
  const { swipe } = useMatchStore();
  const router = useRouter();
  const [dog, setDog] = useState<Dog | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [relation, setRelation] = useState<RelationStatus>("none");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDog();
      if (myDog) checkRelation();
    }
  }, [id]);

  const fetchDog = async () => {
    try {
      const data = await api.get<Dog>(`/api/dogs/${id}`);
      if (data) setDog(data);
    } catch {}
  };

  const checkRelation = async () => {
    if (!myDog) return;
    try {
      const matches = await api.get<Match[]>(`/api/matches?dogId=${myDog.id}`);
      const isMatched = (matches ?? []).some(
        (m) => m.dog_a_id === id || m.dog_b_id === id
      );
      if (isMatched) {
        setRelation("matched");
        return;
      }

      const swipes = await api.get<{ id: string }[]>(
        `/api/swipes/check?swiperId=${myDog.id}&swipedId=${id}`
      );
      if (swipes && swipes.length > 0) {
        setRelation("liked");
      }
    } catch {}
  };

  const handleLike = async () => {
    if (!myDog || !id) return;
    setActionLoading(true);
    const match = await swipe(myDog.id, id, "like");
    if (match) {
      setRelation("matched");
      Alert.alert("配對成功！🎉", "你們互相喜歡！可以開始聊天了");
    } else {
      setRelation("liked");
    }
    setActionLoading(false);
  };

  const handleUnmatch = async () => {
    if (!myDog || !id) return;
    Alert.alert("解除好友", "確定要解除好友嗎？聊天紀錄也會一併刪除。", [
      { text: "取消", style: "cancel" },
      {
        text: "確定解除",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/matches/${id}`, { dogAId: myDog.id, dogBId: id });
            await api.delete("/api/swipes/between", { dogAId: myDog.id, dogBId: id });
          } catch {}
          setRelation("none");
          router.back();
        },
      },
    ]);
  };

  const handleReport = () => {
    Alert.alert("檢舉", "確定要檢舉這個用戶嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "檢舉",
        style: "destructive",
        onPress: () => {
          // In production, this would send a report to the backend
          Alert.alert("已送出", "感謝你的回報，我們會盡快處理。");
        },
      },
    ]);
  };

  if (!dog) {
    return (
      <View style={styles.loading}>
        <Text>載入中...</Text>
      </View>
    );
  }

  const ageText =
    dog.age_months >= 12
      ? `${Math.floor(dog.age_months / 12)} 歲`
      : `${dog.age_months} 個月`;

  const sizeText =
    dog.size === "small" ? "小型犬" : dog.size === "medium" ? "中型犬" : "大型犬";

  const locationText =
    dog.city && dog.district
      ? `${dog.city} ${dog.district}`
      : dog.city || "";

  return (
    <ScrollView style={styles.container}>
      {/* Photo gallery */}
      <View style={styles.photoContainer}>
        {dog.photos && dog.photos.length > 0 ? (
          <>
            <Image source={{ uri: dog.photos[photoIndex] }} style={styles.mainPhoto} />
            {/* Photo indicators */}
            {dog.photos.length > 1 && (
              <View style={styles.indicators}>
                {dog.photos.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setPhotoIndex(i)}
                    style={[styles.indicator, i === photoIndex && styles.indicatorActive]}
                  />
                ))}
              </View>
            )}
            {/* Photo navigation */}
            {dog.photos.length > 1 && (
              <View style={styles.photoNav}>
                <TouchableOpacity
                  style={styles.photoNavBtn}
                  onPress={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
                >
                  <View />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoNavBtn}
                  onPress={() => setPhotoIndex(Math.min(dog.photos.length - 1, photoIndex + 1))}
                >
                  <View />
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noPhoto}>
            <Text style={{ fontSize: 64 }}>🐶</Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)"]}
          style={styles.photoGradient}
        />
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{dog.name}</Text>
          <View style={[styles.genderBadge, { backgroundColor: dog.gender === "male" ? "#64B5F6" : "#F48FB1" }]}>
            <MaterialCommunityIcons
              name={dog.gender === "male" ? "gender-male" : "gender-female"}
              size={18}
              color="#FFF"
            />
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailCards}>
          <View style={styles.detailCard}>
            <MaterialCommunityIcons name="paw" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>品種</Text>
            <Text style={styles.detailValue}>{dog.breed}</Text>
          </View>
          <View style={styles.detailCard}>
            <MaterialCommunityIcons name="calendar-heart" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>年齡</Text>
            <Text style={styles.detailValue}>{ageText}</Text>
          </View>
          <View style={styles.detailCard}>
            <MaterialCommunityIcons name="dog-side" size={20} color={colors.primary} />
            <Text style={styles.detailLabel}>體型</Text>
            <Text style={styles.detailValue}>{sizeText}</Text>
          </View>
        </View>

        {/* Location */}
        {locationText ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>所在地區</Text>
            </View>
            <Text style={styles.sectionText}>{locationText}</Text>
          </View>
        ) : null}

        {/* Personality */}
        {dog.personality.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="emoticon-happy" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>個性</Text>
            </View>
            <View style={styles.tags}>
              {dog.personality.map((tag) => (
                <Chip key={tag} style={styles.tag} textStyle={styles.tagText} compact>
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Bio */}
        {dog.bio ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>自我介紹</Text>
            </View>
            <Text style={styles.bioText}>{dog.bio}</Text>
          </View>
        ) : null}

        {/* Owner */}
        {dog.owner && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-heart" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>主人</Text>
            </View>
            <Text style={styles.sectionText}>{dog.owner.display_name}</Text>
          </View>
        )}

        {/* Actions */}
        {myDog && myDog.id !== id && (
          <View style={styles.actionSection}>
            {relation === "none" && (
              <Button
                mode="contained"
                buttonColor={colors.primary}
                textColor="#FFF"
                style={styles.likeBtn}
                onPress={handleLike}
                icon="heart"
                loading={actionLoading}
                disabled={actionLoading}
              >
                加好友
              </Button>
            )}
            {relation === "liked" && (
              <Button
                mode="outlined"
                textColor={colors.textSecondary}
                style={styles.likedBtn}
                icon="heart-half-full"
                disabled
              >
                已送出邀請
              </Button>
            )}
            {relation === "matched" && (
              <Button
                mode="outlined"
                textColor={colors.accent}
                style={styles.dangerBtn}
                onPress={handleUnmatch}
                icon="heart-broken"
              >
                解除好友
              </Button>
            )}
            <Button
              mode="text"
              textColor={colors.textSecondary}
              onPress={handleReport}
              icon="flag"
            >
              檢舉
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  photoContainer: {
    width: "100%",
    height: width * 0.9,
    position: "relative",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noPhoto: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,140,105,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  indicators: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicatorActive: {
    backgroundColor: "#FFF",
    width: 20,
  },
  photoNav: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  photoNavBtn: {
    flex: 1,
  },
  infoSection: {
    padding: spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.text,
  },
  genderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCards: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    color: colors.text,
  },
  bioText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
  },
  actionSection: {
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  likeBtn: {
    borderRadius: 25,
  },
  likedBtn: {
    borderColor: colors.textSecondary,
    borderRadius: 25,
  },
  dangerBtn: {
    borderColor: colors.accent,
    borderRadius: 25,
  },
});
