import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";
import { colors, spacing } from "../../constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logoScale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ session: any }>("/api/auth/login", { email, password });
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
    } catch (e: any) {
      setError(e.message || "登入失敗");
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={[colors.background, "#FFE8D6", colors.background]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo area */}
          <Animated.View style={[styles.logoArea, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logo}>🐾</Text>
            </View>
            <Text style={styles.title}>PawMate</Text>
            <Text style={styles.subtitle}>找到狗狗的最佳玩伴</Text>
          </Animated.View>

          {/* Form area */}
          <Animated.View style={[styles.formCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              left={<TextInput.Icon icon="email-outline" color={colors.textSecondary} />}
            />

            <TextInput
              label="密碼"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              left={<TextInput.Icon icon="lock-outline" color={colors.textSecondary} />}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.primary}
              labelStyle={styles.buttonLabel}
            >
              登入
            </Button>

            <Link href="/(auth)/register" asChild>
              <Button mode="text" textColor={colors.primary}>
                還沒有帳號？立即註冊
              </Button>
            </Link>
          </Animated.View>

          {/* Decorative paws */}
          <Text style={styles.paw1}>🐾</Text>
          <Text style={styles.paw2}>🐾</Text>
          <Text style={styles.paw3}>🐕</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,140,105,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logo: {
    fontSize: 52,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 24,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: "transparent",
  },
  error: {
    color: colors.accent,
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 13,
  },
  button: {
    marginBottom: spacing.md,
    borderRadius: 25,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paw1: {
    position: "absolute",
    top: 60,
    left: 20,
    fontSize: 28,
    opacity: 0.15,
    transform: [{ rotate: "-25deg" }],
  },
  paw2: {
    position: "absolute",
    top: 100,
    right: 30,
    fontSize: 22,
    opacity: 0.12,
    transform: [{ rotate: "20deg" }],
  },
  paw3: {
    position: "absolute",
    bottom: 40,
    right: 40,
    fontSize: 36,
    opacity: 0.1,
  },
});
