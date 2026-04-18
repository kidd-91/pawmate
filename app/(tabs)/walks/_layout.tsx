import { Stack } from "expo-router";
import { colors } from "../../../constants/theme";

export default function WalksLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ title: "發起揪團" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
