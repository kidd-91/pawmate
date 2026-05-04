import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

// Closes the in-app browser cleanly when auth completes (mobile only).
WebBrowser.maybeCompleteAuthSession();

// On web Supabase auto-extracts the session from the URL hash via
// detectSessionInUrl. On native we have to open an in-app browser, then
// pull the access/refresh tokens out of the redirect URL ourselves.
export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (Platform.OS === "web") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return {};
  }

  const redirectTo = Linking.createURL("auth-callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) return { error: error?.message || "無法啟動 Google 登入" };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return { error: "Google 登入已取消" };

  const url = new URL(result.url);
  const fragment = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const params = new URLSearchParams(fragment);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return { error: "Google 回傳缺少憑證" };

  const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
  if (setErr) return { error: setErr.message };
  return {};
}
