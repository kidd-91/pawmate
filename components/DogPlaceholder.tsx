import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

interface DogPlaceholderProps {
  size?: "small" | "medium" | "large";
  name?: string;
}

const sizes = {
  small: { container: 56, icon: 28, emoji: 24 },
  medium: { container: 80, icon: 40, emoji: 32 },
  large: { container: 200, icon: 80, emoji: 64 },
};

export default function DogPlaceholder({ size = "medium", name }: DogPlaceholderProps) {
  const s = sizes[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: s.container,
          height: s.container,
          borderRadius: size === "large" ? 24 : s.container / 2,
        },
      ]}
    >
      <Text style={{ fontSize: s.emoji }}>🐶</Text>
      {size === "large" && name && (
        <Text style={styles.name}>{name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,140,105,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
  },
});
