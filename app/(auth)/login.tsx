import { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors, spacing } from "../../constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>PawMate</Text>
        <Text style={styles.subtitle}>找到狗狗的最佳玩伴</Text>

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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  logo: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.accent,
    textAlign: "center",
    marginBottom: spacing.md,
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
});
