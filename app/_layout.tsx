import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { theme } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

export default function RootLayout() {
  const { session, setSession, loading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const { fetchProfile, fetchMyDog } = useAuthStore.getState();
        setSession(session);
        // After every auth transition (including initial restore from
        // AsyncStorage), pull the user's profile + their dog from the
        // server. Without this, screens that depend on myDog.id —
        // chat list / matches — stay empty until the user happens to
        // navigate to a tab that fetches it themselves, which made
        // matches appear to disappear after our store-reset fix.
        if (session?.user?.id) {
          fetchProfile();
          fetchMyDog();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, loading, segments]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <Slot />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
