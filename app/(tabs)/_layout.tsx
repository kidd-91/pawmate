import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";

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
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="cards-heart-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "附近",
          headerTitle: () => <CustomHeader title="附近的狗狗" emoji="📍" />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="map-marker-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "好友",
          headerTitle: () => <CustomHeader title="我的好友" emoji="💕" />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="heart-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="walks"
        options={{
          title: "揪團",
          headerTitle: () => <CustomHeader title="遛狗揪團" emoji="🏃" />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="paw" color={color} size={size} focused={focused} />
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
        name="profile"
        options={{
          title: "我的",
          headerTitle: () => <CustomHeader title="我的檔案" emoji="🐶" />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="account-circle-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dog"
        options={{
          href: null,
        }}
      />
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
});
