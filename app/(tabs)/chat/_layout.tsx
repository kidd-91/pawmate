import { Stack } from "expo-router";
import { colors } from "../../../constants/theme";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: "聊天" }} />
      <Stack.Screen name="[id]" options={{ title: "聊天室" }} />
    </Stack>
  );
}
