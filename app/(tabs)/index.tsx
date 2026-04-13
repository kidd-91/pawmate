import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Text, Button, Portal, Modal } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useMatchStore } from "../../stores/matchStore";
import DogCard from "../../components/DogCard";
import { useRouter } from "expo-router";
import type { Match } from "../../types";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

export default function ExploreScreen() {
  const { myDog, fetchMyDog, session } = useAuthStore();
  const { candidates, fetchCandidates, swipe, loadingCandidates } = useMatchStore();
  const [matchPopup, setMatchPopup] = useState<Match | null>(null);
  const router = useRouter();

  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const passOpacity = pan.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (session && !myDog) fetchMyDog();
  }, [session]);

  useEffect(() => {
    if (myDog) fetchCandidates(myDog.id);
  }, [myDog]);

  const handleSwipeComplete = async (direction: "like" | "pass") => {
    if (!myDog || candidates.length === 0) return;
    const target = candidates[0];
    const match = await swipe(myDog.id, target.id, direction);
    if (match) setMatchPopup(match);
    pan.setValue({ x: 0, y: 0 });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        Animated.spring(pan, {
          toValue: { x: width + 100, y: gesture.dy },
          useNativeDriver: false,
        }).start(() => handleSwipeComplete("like"));
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        Animated.spring(pan, {
          toValue: { x: -width - 100, y: gesture.dy },
          useNativeDriver: false,
        }).start(() => handleSwipeComplete("pass"));
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  if (!myDog) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🐕</Text>
        <Text style={styles.emptyTitle}>還沒有建立狗狗檔案</Text>
        <Text style={styles.emptyText}>先到「我的」頁面建立你家狗狗的檔案吧！</Text>
        <Button
          mode="contained"
          buttonColor={colors.primary}
          onPress={() => router.push("/(tabs)/profile")}
          style={{ borderRadius: 25, marginTop: spacing.md }}
        >
          建立狗狗檔案
        </Button>
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>
          {loadingCandidates ? "尋找狗狗中..." : "附近暫時沒有新狗狗"}
        </Text>
        <Text style={styles.emptyText}>晚點再來看看吧！</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Next card (behind) */}
        {candidates.length > 1 && (
          <View style={[styles.cardWrapper, { zIndex: 0 }]}>
            <DogCard dog={candidates[1]} />
          </View>
        )}

        {/* Current card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              zIndex: 1,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Like / Pass overlays */}
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={[styles.stampText, { color: colors.like }]}>LIKE ❤️</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}>
            <Text style={[styles.stampText, { color: colors.pass }]}>PASS 👋</Text>
          </Animated.View>
          <DogCard dog={candidates[0]} />
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          buttonColor={colors.pass}
          onPress={() => {
            Animated.spring(pan, {
              toValue: { x: -width - 100, y: 0 },
              useNativeDriver: false,
            }).start(() => handleSwipeComplete("pass"));
          }}
          style={styles.actionBtn}
          contentStyle={styles.actionContent}
        >
          <MaterialCommunityIcons name="close" size={28} color="#FFF" />
        </Button>
        <Button
          mode="contained"
          buttonColor={colors.like}
          onPress={() => {
            Animated.spring(pan, {
              toValue: { x: width + 100, y: 0 },
              useNativeDriver: false,
            }).start(() => handleSwipeComplete("like"));
          }}
          style={styles.actionBtn}
          contentStyle={styles.actionContent}
        >
          <MaterialCommunityIcons name="heart" size={28} color="#FFF" />
        </Button>
      </View>

      {/* Match popup */}
      <Portal>
        <Modal
          visible={!!matchPopup}
          onDismiss={() => setMatchPopup(null)}
          contentContainerStyle={styles.matchModal}
        >
          <Text style={styles.matchEmoji}>🎉</Text>
          <Text style={styles.matchTitle}>配對成功！</Text>
          <Text style={styles.matchText}>
            你們的狗狗互相喜歡對方！快去聊天認識一下吧！
          </Text>
          <Button
            mode="contained"
            buttonColor={colors.primary}
            onPress={() => {
              setMatchPopup(null);
              router.push("/(tabs)/chat");
            }}
            style={{ borderRadius: 25, marginTop: spacing.md }}
          >
            開始聊天
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    position: "absolute",
  },
  stamp: {
    position: "absolute",
    top: 40,
    zIndex: 10,
    borderWidth: 4,
    borderRadius: 12,
    padding: 8,
  },
  likeStamp: {
    left: 20,
    borderColor: colors.like,
    transform: [{ rotate: "-15deg" }],
  },
  passStamp: {
    right: 20,
    borderColor: colors.pass,
    transform: [{ rotate: "15deg" }],
  },
  stampText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingBottom: spacing.xl,
  },
  actionBtn: {
    borderRadius: 50,
    width: 64,
    height: 64,
  },
  actionContent: {
    width: 64,
    height: 64,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  matchModal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: "center",
  },
  matchEmoji: {
    fontSize: 72,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: spacing.md,
  },
  matchText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
