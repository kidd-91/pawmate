import { useState } from "react";
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../constants/theme";
import type { Dog } from "../types";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - spacing.lg * 2, 400);
const CARD_HEIGHT = Math.min(height * 0.6, CARD_WIDTH * 1.3);

interface DogCardProps {
  dog: Dog;
  commonTraits?: number;
  matchLabel?: string;
}

export default function DogCard({ dog, commonTraits, matchLabel }: DogCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const ageText =
    dog.age_months >= 12
      ? `${Math.floor(dog.age_months / 12)} 歲`
      : `${dog.age_months} 個月`;

  const locationText =
    dog.city && dog.district
      ? `${dog.city} ${dog.district}`
      : dog.city || "";

  const hasMultiplePhotos = dog.photos && dog.photos.length > 1;

  const handlePhotoTap = (side: "left" | "right") => {
    if (!hasMultiplePhotos) return;
    if (side === "right") {
      setPhotoIndex((i) => Math.min(dog.photos.length - 1, i + 1));
    } else {
      setPhotoIndex((i) => Math.max(0, i - 1));
    }
  };

  return (
    <View style={styles.card}>
      <Image
        source={
          dog.photos && dog.photos.length > 0
            ? { uri: dog.photos[photoIndex] }
            : require("../assets/icon.png")
        }
        style={styles.image}
      />

      {/* Photo indicators */}
      {hasMultiplePhotos && (
        <View style={styles.indicatorRow}>
          {dog.photos.map((_, i) => (
            <View
              key={i}
              style={[styles.indicator, i === photoIndex && styles.indicatorActive]}
            />
          ))}
        </View>
      )}

      {/* Tap zones for photo navigation */}
      {hasMultiplePhotos && (
        <View style={styles.tapZones}>
          <TouchableOpacity
            style={styles.tapZone}
            onPress={() => handlePhotoTap("left")}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.tapZone}
            onPress={() => handlePhotoTap("right")}
            activeOpacity={1}
          />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.03)", "rgba(0,0,0,0.65)"]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Info overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.info}>
          {/* Name row */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{dog.name}</Text>
            <View style={[styles.genderBadge, { backgroundColor: dog.gender === "male" ? "#64B5F6" : "#F48FB1" }]}>
              <MaterialCommunityIcons
                name={dog.gender === "male" ? "gender-male" : "gender-female"}
                size={16}
                color="#FFF"
              />
            </View>
          </View>

          {/* Match hint badge */}
          {matchLabel ? (
            <View style={styles.commonBadge}>
              <MaterialCommunityIcons name="heart-multiple" size={14} color="#FFF" />
              <Text style={styles.commonText}>{matchLabel}</Text>
            </View>
          ) : commonTraits && commonTraits > 0 ? (
            <View style={styles.commonBadge}>
              <MaterialCommunityIcons name="heart-multiple" size={14} color="#FFF" />
              <Text style={styles.commonText}>你們有 {commonTraits} 個共同特質</Text>
            </View>
          ) : null}

          {/* Details row with icons */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="paw" size={14} color="#FFD166" />
              <Text style={styles.detailText}>{dog.breed}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar-heart" size={14} color="#FFD166" />
              <Text style={styles.detailText}>{ageText}</Text>
            </View>
            {locationText ? (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#FFD166" />
                <Text style={styles.detailText}>{locationText}</Text>
              </View>
            ) : (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="dog-side" size={14} color="#FFD166" />
                <Text style={styles.detailText}>
                  {dog.size === "small" ? "小型" : dog.size === "medium" ? "中型" : "大型"}
                </Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {dog.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              "{dog.bio}"
            </Text>
          ) : null}

          {/* Personality tags */}
          {dog.personality.length > 0 && (
            <View style={styles.tags}>
              {dog.personality.slice(0, 5).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Owner */}
          {dog.owner && (
            <View style={styles.ownerRow}>
              <MaterialCommunityIcons name="account-heart" size={13} color="#CCC" />
              <Text style={styles.owner}>{dog.owner.display_name}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.card,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  indicatorRow: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  indicatorActive: {
    backgroundColor: "#FFF",
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 5,
  },
  tapZone: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  info: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  genderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  commonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,107,107,0.85)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  commonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#EEE",
  },
  bio: {
    fontSize: 13,
    color: "#DDD",
    marginTop: spacing.sm,
    fontStyle: "italic",
    lineHeight: 18,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: 6,
  },
  tag: {
    backgroundColor: "rgba(255,140,105,0.85)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  owner: {
    fontSize: 12,
    color: "#CCC",
  },
});
