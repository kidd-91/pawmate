import { View, StyleSheet, Image, Dimensions } from "react-native";
import { Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../constants/theme";
import type { Dog } from "../types";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - spacing.lg * 2, 400);
const CARD_HEIGHT = Math.min(height * 0.6, CARD_WIDTH * 1.3);

interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  const ageText =
    dog.age_months >= 12
      ? `${Math.floor(dog.age_months / 12)} 歲`
      : `${dog.age_months} 個月`;

  const sizeText =
    dog.size === "small" ? "小型犬" : dog.size === "medium" ? "中型犬" : "大型犬";

  return (
    <View style={styles.card}>
      <Image
        source={
          dog.photos && dog.photos.length > 0
            ? { uri: dog.photos[0] }
            : require("../assets/icon.png")
        }
        style={styles.image}
      />
      <View style={styles.overlay}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{dog.name}</Text>
            <MaterialCommunityIcons
              name={dog.gender === "male" ? "gender-male" : "gender-female"}
              size={22}
              color={dog.gender === "male" ? "#64B5F6" : "#F48FB1"}
            />
          </View>
          <Text style={styles.details}>
            {dog.breed} · {ageText} · {sizeText}
          </Text>
          {dog.bio ? <Text style={styles.bio} numberOfLines={2}>{dog.bio}</Text> : null}
          <View style={styles.tags}>
            {dog.personality.slice(0, 4).map((tag) => (
              <Chip
                key={tag}
                style={styles.tag}
                textStyle={styles.tagText}
                compact
              >
                {tag}
              </Chip>
            ))}
          </View>
          {dog.owner && (
            <Text style={styles.owner}>
              主人：{dog.owner.display_name}
            </Text>
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  info: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
  },
  details: {
    fontSize: 14,
    color: "#EEE",
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    color: "#DDD",
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: 6,
  },
  tag: {
    backgroundColor: "rgba(255,140,66,0.8)",
    borderRadius: 12,
  },
  tagText: {
    color: "#FFF",
    fontSize: 11,
  },
  owner: {
    fontSize: 12,
    color: "#CCC",
    marginTop: spacing.sm,
  },
});
