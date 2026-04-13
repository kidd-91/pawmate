import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Dog, Match } from "../types";

interface MatchState {
  candidates: Dog[];
  matches: Match[];
  loadingCandidates: boolean;
  fetchCandidates: (myDogId: string) => Promise<void>;
  swipe: (myDogId: string, targetDogId: string, direction: "like" | "pass") => Promise<Match | null>;
  fetchMatches: (myDogId: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  candidates: [],
  matches: [],
  loadingCandidates: false,

  fetchCandidates: async (myDogId) => {
    set({ loadingCandidates: true });

    // Get dogs I already swiped on
    const { data: swipedIds } = await supabase
      .from("swipes")
      .select("swiped_dog_id")
      .eq("swiper_dog_id", myDogId);

    const excludeIds = [myDogId, ...(swipedIds?.map((s) => s.swiped_dog_id) ?? [])];

    const { data: dogs } = await supabase
      .from("dogs")
      .select("*, owner:profiles(*)")
      .eq("is_active", true)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .limit(20);

    set({ candidates: dogs ?? [], loadingCandidates: false });
  },

  swipe: async (myDogId, targetDogId, direction) => {
    await supabase.from("swipes").insert({
      swiper_dog_id: myDogId,
      swiped_dog_id: targetDogId,
      direction,
    });

    // Remove from candidates
    set((s) => ({
      candidates: s.candidates.filter((d) => d.id !== targetDogId),
    }));

    if (direction === "pass") return null;

    // Check if it's a match (other dog also liked us)
    const { data: reverseSwipe } = await supabase
      .from("swipes")
      .select("id")
      .eq("swiper_dog_id", targetDogId)
      .eq("swiped_dog_id", myDogId)
      .eq("direction", "like")
      .single();

    if (reverseSwipe) {
      const { data: match } = await supabase
        .from("matches")
        .insert({ dog_a_id: myDogId, dog_b_id: targetDogId })
        .select("*, dog_a:dogs!matches_dog_a_id_fkey(*), dog_b:dogs!matches_dog_b_id_fkey(*)")
        .single();
      return match ?? null;
    }

    return null;
  },

  fetchMatches: async (myDogId) => {
    const { data } = await supabase
      .from("matches")
      .select("*, dog_a:dogs!matches_dog_a_id_fkey(*, owner:profiles(*)), dog_b:dogs!matches_dog_b_id_fkey(*, owner:profiles(*))")
      .or(`dog_a_id.eq.${myDogId},dog_b_id.eq.${myDogId}`)
      .order("created_at", { ascending: false });

    set({ matches: data ?? [] });
  },
}));
