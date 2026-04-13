import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../constants/theme";

interface Props {
  latitude: number;
  longitude: number;
  children?: React.ReactNode;
}

export default function NativeMap({ latitude, longitude }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.text}>
        地圖功能在手機 App 上可用
      </Text>
      <Text style={styles.coords}>
        目前位置：{latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  icon: { fontSize: 48, marginBottom: spacing.md },
  text: { fontSize: 16, fontWeight: "bold", color: colors.text },
  coords: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
});
