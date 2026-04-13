import { View, StyleSheet, Image, Dimensions } from "react-native";
import { Text, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../constants/theme";
import type { Dog } from "../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - spacing.lg * 2;

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
          dog.photos.length > 0
            ? { uri: dog.photos[0] }
            : require("../assets/icon.png")
        }
        style={styles.image}
      />
      <View style={styles.overlay}>
        <View style={styles.info}>
          <Text style={styles.name}>
            {dog.name}{" "}
            <MaterialCommunityIcons
              name={dog.gender === "male" ? "gender-male" : "gender-female"}
              size={24}
              color={dog.gender === "male" ? "#64B5F6" : "#F48FB1"}
            />
          </Text>
          <Text style={styles.details}>
            {dog.breed} · {ageText} · {sizeText}
          </Text>
          {dog.bio ? <Text style={styles.bio}>{dog.bio}</Text> : null}
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
              🧑 主人：{dog.owner.display_name}
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
    height: CARD_WIDTH * 1.3,
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  info: {
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  details: {
    fontSize: 16,
    color: "#EEE",
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
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
    fontSize: 12,
  },
  owner: {
    fontSize: 13,
    color: "#CCC",
    marginTop: spacing.sm,
  },
});
