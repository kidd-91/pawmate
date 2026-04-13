import { create } from "zustand";
import { supabase } from "../lib/supabase";
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
    const userId = get().session?.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) set({ profile: data });
  },

  fetchMyDog: async () => {
    const userId = get().session?.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .limit(1)
      .single();
    if (data) set({ myDog: data });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, myDog: null });
  },
}));
