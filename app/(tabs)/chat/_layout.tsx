import { Stack } from "expo-router";
import { colors } from "../../../constants/theme";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "聊天",
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
