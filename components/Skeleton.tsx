import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors } from "../constants/theme";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width="100%" height={280} borderRadius={24} />
      <View style={skeletonStyles.cardInfo}>
        <Skeleton width={120} height={24} borderRadius={12} />
        <Skeleton width={180} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        <View style={skeletonStyles.tags}>
          <Skeleton width={50} height={24} borderRadius={12} />
          <Skeleton width={50} height={24} borderRadius={12} />
          <Skeleton width={50} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

export function ChatItemSkeleton() {
  return (
    <View style={skeletonStyles.chatItem}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={skeletonStyles.chatInfo}>
        <Skeleton width={100} height={18} borderRadius={9} />
        <Skeleton width={180} height={14} borderRadius={7} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
  cardInfo: {
    padding: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  chatInfo: {
    flex: 1,
  },
});
