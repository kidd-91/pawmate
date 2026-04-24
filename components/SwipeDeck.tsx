import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, Button, Portal, Modal } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors, spacing } from "../constants/theme";
import { useAuthStore } from "../stores/authStore";
import { useMatchStore } from "../stores/matchStore";
import DogCard from "./DogCard";
import HeartParticles from "./HeartParticles";
import { getMatchHint } from "../lib/tagSort";
import type { Match } from "../types";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.2;

export default function SwipeDeck() {
  const { myDog } = useAuthStore();
  const { candidates, fetchCandidates, swipe, loadingCandidates } = useMatchStore();
  const [matchPopup, setMatchPopup] = useState<Match | null>(null);
  const [showHearts, setShowHearts] = useState(false);
  const router = useRouter();

  const swipingRef = useRef(false);
  const [swipingState, setSwipingState] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const matchScale = useRef(new Animated.Value(0)).current;
  const matchRotate = useRef(new Animated.Value(0)).current;

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
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
  const nextCardScale = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.95, 1],
    extrapolate: "clamp",
  });
  const nextCardOpacity = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.6, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (myDog) fetchCandidates(myDog.id, myDog);
  }, [myDog]);

  useEffect(() => {
    candidates.slice(1, 4).forEach((dog) => {
      if (dog.photos?.[0]) Image.prefetch(dog.photos[0]);
    });
  }, [candidates]);

  const setSwiping = useCallback((v: boolean) => {
    swipingRef.current = v;
    setSwipingState(v);
  }, []);

  const showMatchPopupFn = useCallback((match: Match) => {
    setMatchPopup(match);
    matchScale.setValue(0);
    matchRotate.setValue(-0.1);
    Animated.sequence([
      Animated.spring(matchScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.spring(matchRotate, { toValue: 0, friction: 3, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSwipeComplete = useCallback(
    async (direction: "like" | "pass") => {
      if (!myDog || candidates.length === 0 || swipingRef.current) return;
      setSwiping(true);
      if (direction === "like") setShowHearts(true);
      const target = candidates[0];
      const match = await swipe(myDog.id, target.id, direction);
      if (match) showMatchPopupFn(match);
      pan.setValue({ x: 0, y: 0 });
      setSwiping(false);
    },
    [myDog, candidates, swipe]
  );

  const animateSwipe = useCallback(
    (direction: "like" | "pass") => {
      if (swipingRef.current) return;
      if (direction === "like") setShowHearts(true);
      const toX = direction === "like" ? width + 100 : -width - 100;
      Animated.timing(pan, {
        toValue: { x: toX, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => handleSwipeComplete(direction));
    },
    [handleSwipeComplete]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !swipingRef.current,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !swipingRef.current && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5),
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (swipingRef.current) return;
          if (gesture.dx > SWIPE_THRESHOLD && gesture.vx > 0) {
            setShowHearts(true);
            Animated.timing(pan, {
              toValue: { x: width + 100, y: gesture.dy },
              duration: 250,
              useNativeDriver: false,
            }).start(() => handleSwipeComplete("like"));
          } else if (gesture.dx < -SWIPE_THRESHOLD && gesture.vx < 0) {
            Animated.timing(pan, {
              toValue: { x: -width - 100, y: gesture.dy },
              duration: 250,
              useNativeDriver: false,
            }).start(() => handleSwipeComplete("pass"));
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [handleSwipeComplete]
  );

  if (!myDog) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🐕</Text>
          <Text style={styles.emptyTitle}>還沒有建立狗狗檔案</Text>
          <Text style={styles.emptyText}>先到「我」頁面{"\n"}建立你家狗狗的檔案吧！</Text>
          <Button
            mode="contained"
            buttonColor={colors.primary}
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.emptyBtn}
            icon="paw"
          >
            建立狗狗檔案
          </Button>
        </View>
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>{loadingCandidates ? "🔍" : "🐾"}</Text>
          <Text style={styles.emptyTitle}>
            {loadingCandidates ? "尋找狗狗中..." : "附近暫時沒有新狗狗"}
          </Text>
          <Text style={styles.emptyText}>
            {loadingCandidates
              ? "正在搜尋附近的狗狗朋友..."
              : "目前沒有新的狗狗了\n過一陣子再來看看吧！"}
          </Text>
          {!loadingCandidates && (
            <Button
              mode="outlined"
              textColor={colors.primary}
              onPress={() => myDog && fetchCandidates(myDog.id, myDog)}
              style={styles.emptyBtn}
              icon="refresh"
            >
              重新搜尋
            </Button>
          )}
        </View>
      </View>
    );
  }

  const matchSpin = matchRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.counterBar}>
        <Text style={styles.counterText}>還有 {candidates.length} 隻狗狗等你認識</Text>
      </View>

      <View style={styles.cardContainer}>
        {candidates.length > 1 && (
          <Animated.View
            style={[
              styles.cardWrapper,
              { zIndex: 0, transform: [{ scale: nextCardScale }], opacity: nextCardOpacity },
            ]}
          >
            <DogCard dog={candidates[1]} />
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.cardWrapper,
            { zIndex: 1, transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={[styles.stampText, { color: colors.like }]}>LIKE ❤️</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]}>
            <Text style={[styles.stampText, { color: colors.pass }]}>PASS 👋</Text>
          </Animated.View>
          <DogCard
            dog={candidates[0]}
            matchLabel={myDog ? getMatchHint(candidates[0], myDog)?.label : undefined}
          />
        </Animated.View>
      </View>

      <HeartParticles visible={showHearts} onComplete={() => setShowHearts(false)} />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn, swipingState && styles.btnDisabled]}
          disabled={swipingState}
          onPress={() => animateSwipe("pass")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="close" size={32} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn, swipingState && styles.btnDisabled]}
          disabled={swipingState}
          onPress={() => animateSwipe("like")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="heart" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Portal>
        <Modal
          visible={!!matchPopup}
          onDismiss={() => setMatchPopup(null)}
          contentContainerStyle={styles.matchModal}
        >
          <Animated.View
            style={{
              alignItems: "center",
              transform: [{ scale: matchScale }, { rotate: matchSpin }],
            }}
          >
            <Text style={styles.matchEmoji}>🎉</Text>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.matchTitleBg}
            >
              <Text style={styles.matchTitle}>配對成功！</Text>
            </LinearGradient>

            {matchPopup && (
              <View style={styles.matchDogsRow}>
                <View style={styles.matchDogAvatar}>
                  <Image
                    source={
                      matchPopup.dog_a?.photos?.length
                        ? { uri: matchPopup.dog_a.photos[0] }
                        : require("../assets/icon.png")
                    }
                    style={styles.matchDogImg}
                  />
                  <Text style={styles.matchDogName}>{matchPopup.dog_a?.name}</Text>
                </View>
                <Text style={styles.matchHeart}>💕</Text>
                <View style={styles.matchDogAvatar}>
                  <Image
                    source={
                      matchPopup.dog_b?.photos?.length
                        ? { uri: matchPopup.dog_b.photos[0] }
                        : require("../assets/icon.png")
                    }
                    style={styles.matchDogImg}
                  />
                  <Text style={styles.matchDogName}>{matchPopup.dog_b?.name}</Text>
                </View>
              </View>
            )}

            <Text style={styles.matchText}>你們的狗狗互相喜歡對方！快去聊天認識一下吧！</Text>
          </Animated.View>
          <Button
            mode="contained"
            buttonColor={colors.primary}
            onPress={() => {
              setMatchPopup(null);
              router.push("/(tabs)/chat");
            }}
            style={{ borderRadius: 25, marginTop: spacing.md }}
          >
            開始聊天 💬
          </Button>
          <Button
            mode="text"
            textColor={colors.textSecondary}
            onPress={() => setMatchPopup(null)}
            style={{ marginTop: spacing.xs }}
          >
            繼續探索
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  counterBar: { alignItems: "center", paddingTop: spacing.sm },
  counterText: { fontSize: 13, color: colors.textSecondary },
  cardContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardWrapper: { position: "absolute" },
  stamp: { position: "absolute", top: 40, zIndex: 10, borderWidth: 4, borderRadius: 12, padding: 8 },
  likeStamp: { left: 20, borderColor: colors.like, transform: [{ rotate: "-15deg" }] },
  passStamp: { right: 20, borderColor: colors.pass, transform: [{ rotate: "15deg" }] },
  stampText: { fontSize: 28, fontWeight: "bold" },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    paddingBottom: spacing.xl,
  },
  actionBtn: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  passBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.pass },
  likeBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.like },
  btnDisabled: { opacity: 0.5 },
  empty: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginHorizontal: spacing.sm,
  },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: colors.text },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: { borderRadius: 25, marginTop: spacing.lg },
  matchModal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 28,
    alignItems: "center",
  },
  matchEmoji: { fontSize: 72 },
  matchTitleBg: { borderRadius: 20, paddingHorizontal: 24, paddingVertical: 8, marginTop: spacing.sm },
  matchTitle: { fontSize: 28, fontWeight: "bold", color: "#FFF" },
  matchDogsRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: spacing.lg },
  matchDogAvatar: { alignItems: "center" },
  matchDogImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.primary },
  matchDogName: { fontSize: 14, fontWeight: "bold", color: colors.text, marginTop: 4 },
  matchHeart: { fontSize: 32 },
  matchText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 22,
  },
});
