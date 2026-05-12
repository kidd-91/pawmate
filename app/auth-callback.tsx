import { Redirect } from "expo-router";

// OAuth deep-link landing route. The actual session is set by
// lib/googleAuth.ts after WebBrowser.openAuthSessionAsync returns the
// access/refresh tokens; we just need *something* at /auth-callback so
// expo-router doesn't show its "unmatched route" page when Supabase
// redirects to dogbond://auth-callback#access_token=...
//
// Root layout's auth gate sends authed users to /(tabs)/index, so we
// just bounce to root.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
