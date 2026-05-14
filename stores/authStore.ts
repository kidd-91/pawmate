import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import { readCache, writeCache, clearCache, clearAllCaches } from "../lib/cache";
import { useMatchStore } from "./matchStore";
import { useHealthStore } from "./healthStore";
import { useExpenseStore } from "./expenseStore";
import { useChatStore } from "./chatStore";
import type { Profile, Dog } from "../types";
import type { Session } from "@supabase/supabase-js";

// Wipe every domain store so a previous user's data doesn't bleed into
// the next user's UI. Used on signOut/deleteAccount and on auth-state
// transitions where the user.id changes (account switch).
function clearAllStores() {
  useMatchStore.getState().reset();
  useHealthStore.getState().reset();
  useExpenseStore.getState().reset();
  useChatStore.getState().reset();
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  myDog: Dog | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  fetchMyDog: () => Promise<void>;
  hydrateFromCache: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  myDog: null,
  loading: true,

  setSession: (session) => {
    const prev = get().session;
    const prevUserId = prev?.user?.id;
    const nextUserId = session?.user?.id;

    // Only three cases need to clear:
    // 1. Switching users (A → B) — different person, wipe everything.
    // 2. Logging out (X → null) — privacy.
    // 3. Initial restore (null → X) or same-user refresh — DO NOT wipe.
    //    Wiping here would erase the data we just hydrated from cache,
    //    which is the bug where users complained "重啟 app 要等 10 秒
    //    才看到資料" — cache loaded fine, then we deleted it ourselves.
    if (prevUserId && nextUserId && prevUserId !== nextUserId) {
      clearAllStores();
      set({ profile: null, myDog: null });
    } else if (prevUserId && !nextUserId) {
      clearAllStores();
      set({ profile: null, myDog: null });
    }

    set({ session, loading: false });
  },

  fetchProfile: async () => {
    try {
      const data = await api.get<Profile>("/api/auth/me");
      set({ profile: data ?? null });
      if (data) writeCache("profile", data);
    } catch {
      // Don't clobber on transient failure (Render cold start) —
      // keep whatever cached value we already have.
    }
  },

  fetchMyDog: async () => {
    try {
      const data = await api.get<Dog>("/api/dogs/mine");
      set({ myDog: data ?? null });
      if (data) writeCache("myDog", data);
      else clearCache("myDog");
    } catch {
      // Same — leave cached myDog alone if the request failed.
    }
  },

  // Called once on app startup, before the network is reachable.
  // Hydrates myDog/profile from disk so screens that depend on them
  // (chat list, expenses, dog dashboard) render immediately instead
  // of showing empty for the duration of the first server fetch.
  hydrateFromCache: async () => {
    const [profile, myDog] = await Promise.all([
      readCache<Profile>("profile"),
      readCache<Dog>("myDog"),
    ]);
    set((s) => ({
      profile: s.profile ?? profile,
      myDog: s.myDog ?? myDog,
    }));
  },

  signOut: async () => {
    clearAllStores();
    await clearAllCaches();
    await supabase.auth.signOut();
    set({ session: null, profile: null, myDog: null });
  },

  deleteAccount: async () => {
    try {
      await api.delete("/api/auth/me");
      clearAllStores();
      await clearAllCaches();
      await supabase.auth.signOut();
      set({ session: null, profile: null, myDog: null });
      return {};
    } catch (e: any) {
      return { error: e.message || "刪除失敗" };
    }
  },
}));
