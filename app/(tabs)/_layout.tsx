import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { useMatchStore } from "../../stores/matchStore";

function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <MaterialCommunityIcons name={name as any} size={size - 2} color={color} />
      </View>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function CustomHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerEmoji}>{emoji}</Text>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function LikesYouHeaderButton() {
  const router = useRouter();
  const count = useMatchStore((s) => s.likesYou.length);
  const hasLikes = count > 0;

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/likes-you")}
      hitSlop={8}
      style={styles.headerBtn}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={hasLikes ? "heart" : "heart-outline"}
        size={24}
        color={hasLikes ? colors.like : colors.textSecondary}
      />
      {hasLikes ? (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 68,
          paddingBottom: 12,
          paddingTop: 6,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "探索",
          headerTitle: () => <CustomHeader title="探索" emoji="🐾" />,
          headerRight: () => <LikesYouHeaderButton />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="cards-heart-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "聊天",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="chat-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dog"
        options={{
          title: "狗狗",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="dog" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "我",
          headerTitle: () => <CustomHeader title="我的檔案" emoji="🐶" />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="account-circle-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      {/* Hidden routes — reachable via in-app navigation but absent from
          the tab bar. likes-you is a sub-screen of 探索. walks is pending
          full removal in Phase 2.5. */}
      <Tabs.Screen name="likes-you" options={{ href: null }} />
      <Tabs.Screen name="walks"     options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,140,105,0.1)",
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  headerBtn: {
    marginRight: spacing.md,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.like,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
