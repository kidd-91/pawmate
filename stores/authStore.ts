import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import type { Profile, Dog } from "../types";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  myDog: Dog | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  fetchMyDog: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  myDog: null,
  loading: true,

  setSession: (session) => set({ session, loading: false }),

  fetchProfile: async () => {
    try {
      const data = await api.get<Profile>("/api/auth/me");
      if (data) set({ profile: data });
    } catch {}
  },

  fetchMyDog: async () => {
    try {
      const data = await api.get<Dog>("/api/dogs/mine");
      if (data) set({ myDog: data });
    } catch {}
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, myDog: null });
  },
}));
