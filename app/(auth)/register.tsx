import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../lib/api";
import { colors, spacing } from "../../constants/theme";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/register", {
        email,
        password,
        displayName,
      });
      Alert.alert("註冊成功", "請查看你的信箱並點擊驗證連結後再登入。");
    } catch (e: any) {
      setError(e.message || "註冊失敗");
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
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Text style={styles.logo}>🐶</Text>
              </View>
              <Text style={styles.title}>加入 PawMate</Text>
              <Text style={styles.subtitle}>為你的毛孩找到新朋友</Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <TextInput
                label="你的名字"
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                left={<TextInput.Icon icon="account-outline" color={colors.textSecondary} />}
              />

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
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor={colors.primary}
                labelStyle={styles.buttonLabel}
              >
                建立帳號
              </Button>

              <Link href="/(auth)/login" asChild>
                <Button mode="text" textColor={colors.primary}>
                  已有帳號？返回登入
                </Button>
              </Link>
            </View>
          </Animated.View>

          {/* Decorative */}
          <Text style={styles.paw1}>🐾</Text>
          <Text style={styles.paw2}>🦴</Text>
        </ScrollView>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,140,105,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logo: {
    fontSize: 44,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 0.5,
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
    top: 50,
    right: 30,
    fontSize: 26,
    opacity: 0.12,
    transform: [{ rotate: "15deg" }],
  },
  paw2: {
    position: "absolute",
    bottom: 50,
    left: 30,
    fontSize: 30,
    opacity: 0.1,
    transform: [{ rotate: "-10deg" }],
  },
});
