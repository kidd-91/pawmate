import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import { useHealthStore } from "../../stores/healthStore";

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

// Notification bell on every tab header. Aggregates pending likes-you +
// upcoming health reminders (within 7 days = "urgent" portion of count).
// Tap → /notifications, which lists all items grouped by urgency.
function NotificationBellButton() {
  const router = useRouter();
  const likesCount = useMatchStore((s) => s.likesYou.length);
  const dueSoon = useHealthStore(
    (s) => s.reminders.filter((r) => r.days_until <= 7).length
  );
  const total = likesCount + dueSoon;
  const has = total > 0;

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/notifications")}
      hitSlop={8}
      style={styles.headerBtn}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={has ? "bell" : "bell-outline"}
        size={24}
        color={has ? colors.primary : colors.textSecondary}
      />
      {has ? (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{total > 99 ? "99+" : total}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// Fetch notification sources globally so the bell badge is correct on any tab,
// not just after the user visits explore / dog. Re-runs when myDog changes.
function NotificationsBootstrap() {
  const myDog = useAuthStore((s) => s.myDog);
  const fetchLikesYou = useMatchStore((s) => s.fetchLikesYou);
  const fetchReminders = useHealthStore((s) => s.fetchReminders);

  useEffect(() => {
    if (!myDog) return;
    fetchLikesYou(myDog.id);
    fetchReminders(30);
  }, [myDog?.id, fetchLikesYou, fetchReminders]);

  return null;
}

export default function TabLayout() {
  return (
    <>
      <NotificationsBootstrap />
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
          headerRight: () => <NotificationBellButton />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "探索",
            headerTitle: () => <CustomHeader title="探索" emoji="🐾" />,
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
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              // Reset to the tab root when re-tapping the active tab,
              // so opening someone's chat then pressing the chat tab
              // returns to the chat list (not stays on the open chat).
              const state = navigation.getState();
              const current = state.routes[state.index];
              if (current.name === route.name) {
                e.preventDefault();
                navigation.navigate(route.name as never, { screen: "index" } as never);
              }
            },
          })}
        />
        <Tabs.Screen
          name="dog"
          options={{
            title: "狗狗",
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon name="dog" color={color} size={size} focused={focused} />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              // Same as chat — re-tapping the dog tab pops back to the
              // owner's own dog dashboard, instead of leaving the user
              // stuck on someone else's profile page they just viewed.
              const state = navigation.getState();
              const current = state.routes[state.index];
              if (current.name === route.name) {
                e.preventDefault();
                navigation.navigate(route.name as never, { screen: "index" } as never);
              }
            },
          })}
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
        {/* Hidden routes — reachable via in-app navigation but absent
            from the tab bar. likes-you / notifications are sub-screens. */}
        <Tabs.Screen name="likes-you"     options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
      </Tabs>
    </>
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
