import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../../constants/theme";

function BackButton() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = () => {
    if (from === "map") {
      router.replace("/(tabs)/map");
    } else if (from === "matches") {
      router.replace("/(tabs)/matches");
    } else if (from === "chat") {
      router.replace("/(tabs)/chat");
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      onPress={handleBack}
      style={{ marginRight: spacing.sm, padding: 4 }}
    >
      <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

export default function DogLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="[id]" options={{ title: "狗狗檔案" }} />
    </Stack>
  );
}
