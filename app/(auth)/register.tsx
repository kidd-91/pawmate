import { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors, spacing } from "../../constants/theme";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Create profile
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: displayName,
      });
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>加入 PawMate</Text>
        <Text style={styles.subtitle}>為你的毛孩找到新朋友</Text>

        <TextInput
          label="你的名字"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
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
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={colors.primary}
          labelStyle={styles.buttonLabel}
        >
          註冊
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button mode="text" textColor={colors.primary}>
            已有帳號？返回登入
          </Button>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  logo: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 32,
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
