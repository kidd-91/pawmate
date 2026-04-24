import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../../constants/theme";

function BackButton() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = () => {
    if (from === "chat") {
      router.replace("/(tabs)/chat");
    } else if (from === "likes-you") {
      router.replace("/(tabs)/likes-you");
    } else if (from === "explore") {
      router.replace("/(tabs)/");
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "我的狗狗",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "狗狗檔案",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="expenses"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="health"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
