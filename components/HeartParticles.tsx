import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Dimensions } from "react-native";
import { Text } from "react-native-paper";

const { width, height } = Dimensions.get("window");
const PARTICLE_COUNT = 12;
const EMOJIS = ["❤️", "🧡", "💛", "💕", "💖", "🐾"];

interface HeartParticlesProps {
  visible: boolean;
  onComplete?: () => void;
}

function Particle({ delay, emoji }: { delay: number; emoji: string }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const startX = Math.random() * width * 0.6 + width * 0.2;
  const startY = height * 0.5;
  const endX = (Math.random() - 0.5) * 200;
  const endY = -(Math.random() * 300 + 150);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8 + Math.random() * 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: endY,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: endX,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: (Math.random() - 0.5) * 4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [-2, 2],
    outputRange: ["-30deg", "30deg"],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate: spin },
          ],
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

export default function HeartParticles({ visible, onComplete }: HeartParticlesProps) {
  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle
          key={i}
          delay={i * 60}
          emoji={EMOJIS[i % EMOJIS.length]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  particle: {
    position: "absolute",
  },
  emoji: {
    fontSize: 28,
  },
});
