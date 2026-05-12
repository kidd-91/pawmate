import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
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
    // Clear domain stores when the user identity actually changes
    // (login, logout, switch account). Stale data — myDog from another
    // user, candidates / matches / messages / health / expenses from
    // a previous session — is the root cause of several reported bugs.
    if (prevUserId !== nextUserId) {
      clearAllStores();
      if (!nextUserId) {
        // Also wipe identity caches when logging out / session expires.
        set({ profile: null, myDog: null });
      }
    }
    set({ session, loading: false });
  },

  fetchProfile: async () => {
    try {
      const data = await api.get<Profile>("/api/auth/me");
      set({ profile: data ?? null });
    } catch {
      set({ profile: null });
    }
  },

  fetchMyDog: async () => {
    try {
      const data = await api.get<Dog>("/api/dogs/mine");
      // Important: always set, even on null/empty — otherwise a previous
      // user's dog stays cached when the new user has no dog yet.
      set({ myDog: data ?? null });
    } catch {
      set({ myDog: null });
    }
  },

  signOut: async () => {
    clearAllStores();
    await supabase.auth.signOut();
    set({ session: null, profile: null, myDog: null });
  },

  deleteAccount: async () => {
    try {
      await api.delete("/api/auth/me");
      clearAllStores();
      await supabase.auth.signOut();
      set({ session: null, profile: null, myDog: null });
      return {};
    } catch (e: any) {
      return { error: e.message || "刪除失敗" };
    }
  },
}));
