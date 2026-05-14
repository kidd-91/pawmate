import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Tiny safe wrapper around AsyncStorage for caching server data.
 *
 * Why this instead of zustand's persist middleware: persist hooks into
 * store creation and tries to hydrate eagerly. We had a streak of
 * builds (7-10) where it crashed on launch — likely a race with
 * Supabase session restoration. This module is dumber on purpose:
 * stores call read/write/clear explicitly, no middleware, no timing
 * surprises. Failure to read returns null; failure to write is
 * silently logged. Caches are a hint, not source of truth.
 */

const PREFIX = "dogbond:";

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // best-effort — quota / corrupt state shouldn't crash the app
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {}
}

export async function clearAllCaches(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(PREFIX));
    if (ours.length > 0) await AsyncStorage.multiRemove(ours);
  } catch {}
}
