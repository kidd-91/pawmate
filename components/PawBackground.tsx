import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

const PAWS = [
  { emoji: "🐾", top: "4%", left: "6%", size: 20, rotate: "-20deg", opacity: 0.06 },
  { emoji: "🐾", top: "11%", right: "12%", size: 15, rotate: "15deg", opacity: 0.05 },
  { emoji: "🦴", top: "19%", left: "62%", size: 17, rotate: "30deg", opacity: 0.04 },
  { emoji: "🐾", top: "27%", left: "18%", size: 22, rotate: "-10deg", opacity: 0.05 },
  { emoji: "🐾", top: "36%", right: "8%", size: 14, rotate: "5deg", opacity: 0.04 },
  { emoji: "🐾", top: "44%", left: "4%", size: 17, rotate: "25deg", opacity: 0.06 },
  { emoji: "🦴", top: "51%", left: "42%", size: 15, rotate: "-15deg", opacity: 0.04 },
  { emoji: "🐾", top: "59%", right: "18%", size: 20, rotate: "10deg", opacity: 0.05 },
  { emoji: "🐾", top: "68%", left: "28%", size: 15, rotate: "-25deg", opacity: 0.04 },
  { emoji: "🦴", top: "76%", right: "6%", size: 17, rotate: "20deg", opacity: 0.05 },
  { emoji: "🐾", top: "84%", left: "10%", size: 22, rotate: "5deg", opacity: 0.06 },
  { emoji: "🐾", top: "91%", left: "52%", size: 15, rotate: "-10deg", opacity: 0.04 },
];

export default function PawBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      {PAWS.map((paw, i) => (
        <Text
          key={i}
          style={[
            styles.paw,
            {
              top: paw.top as any,
              left: paw.left as any,
              right: paw.right as any,
              fontSize: paw.size,
              opacity: paw.opacity,
              transform: [{ rotate: paw.rotate }],
            },
          ]}
        >
          {paw.emoji}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  paw: {
    position: "absolute",
  },
});
