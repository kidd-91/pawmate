import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import { useMatchStore } from "./matchStore";
import { useHealthStore } from "./healthStore";
import { useExpenseStore } from "./expenseStore";
import { useChatStore } from "./chatStore";
import type { Profile, Dog } from "../types";
import type { Session } from "@supabase/supabase-js";

// Wipe every domain store so a previous user's data doesn't bleed into
// the next user's UI. Used on signOut/deleteAccount and on genuine
// account switches (user A → user B). NOT used on initial session
// restore from disk — that would defeat the whole point of persisting
// myDog/matches/etc.
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      profile: null,
      myDog: null,
      loading: true,

      setSession: (session) => {
        const prev = get().session;
        const prevUserId = prev?.user?.id;
        const nextUserId = session?.user?.id;

        // Three cases:
        // 1. Switching users (A → B): wipe everything, B is a different person.
        // 2. Logging out (X → null): wipe everything.
        // 3. Initial restore (null → X) or same-user refresh (X → X):
        //    DO NOT wipe — the persisted myDog/matches/expenses are the
        //    whole reason the user sees their data instantly on launch.
        //
        // Bug history: an earlier version cleared on case 3 too, which
        // is why every app update felt like data disappeared — the
        // chat list / expenses page render before fetchMyDog finishes,
        // and with cleared state they show empty.
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
          // Only overwrite on a definitive answer. Network errors below
          // fall through to the catch and leave the cached profile alone.
          set({ profile: data ?? null });
        } catch {
          // Keep cached profile on transient failure (e.g. Render cold start).
          // Without this, every restart-during-Render-sleep would wipe profile.
        }
      },

      fetchMyDog: async () => {
        try {
          const data = await api.get<Dog>("/api/dogs/mine");
          set({ myDog: data ?? null });
        } catch {
          // Keep cached myDog on transient failure. The chat / expenses /
          // health tabs gate everything on myDog.id — clobbering it to
          // null because Render took too long to wake up would erase
          // the user's whole UI for 30+ seconds.
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
    }),
    {
      name: "dogbond-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only the identity / cached resources. Session is owned
      // and persisted by Supabase itself (a separate AsyncStorage key);
      // loading is transient UI state.
      partialize: (state) => ({
        profile: state.profile,
        myDog: state.myDog,
      }),
      // After AsyncStorage rehydration completes, we know we're done
      // with the initial-load phase. Flip loading=false so the auth
      // gate in _layout can route immediately based on persisted data.
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = false;
      },
    }
  )
);
