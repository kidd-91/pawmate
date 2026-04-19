import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../../constants/theme";

export default function WalksLayout() {
  const router = useRouter();

  const backButton = () => (
    <TouchableOpacity onPress={() => router.replace("/(tabs)/walks")} style={{ marginRight: 8 }}>
      <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ title: "發起揪團", headerLeft: backButton }} />
      <Stack.Screen name="[id]" options={{ title: "", headerLeft: backButton }} />
    </Stack>
  );
}
