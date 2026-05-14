import { create } from "zustand";
import { api } from "../lib/api";
import { readCache, writeCache } from "../lib/cache";
import type { Dog, Match } from "../types";
import { sortCandidates } from "../lib/tagSort";

interface SwipeResponse {
  matched: boolean;
  match?: Match;
}

export interface LikedYouDog extends Dog {
  liked_at?: string;
}

interface MatchState {
  candidates: Dog[];
  matches: Match[];
  likesYou: LikedYouDog[];
  loadingCandidates: boolean;
  fetchCandidates: (myDogId: string, myDog?: Dog) => Promise<void>;
  swipe: (myDogId: string, targetDogId: string, direction: "like" | "pass") => Promise<Match | null>;
  fetchMatches: (myDogId: string) => Promise<void>;
  fetchLikesYou: (myDogId: string) => Promise<void>;
  hydrateFromCache: () => Promise<void>;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  candidates: [],
  matches: [],
  likesYou: [],
  loadingCandidates: false,

  reset: () => set({ candidates: [], matches: [], likesYou: [], loadingCandidates: false }),

  fetchCandidates: async (myDogId, myDog) => {
    set({ loadingCandidates: true });

    try {
      const dogs = await api.get<Dog[]>(`/api/dogs/candidates/list?dogId=${myDogId}`);
      const sorted = myDog ? sortCandidates(dogs ?? [], myDog) : (dogs ?? []);
      set({ candidates: sorted, loadingCandidates: false });
    } catch {
      set({ loadingCandidates: false });
    }
  },

  swipe: async (myDogId, targetDogId, direction) => {
    set((s) => ({
      candidates: s.candidates.filter((d) => d.id !== targetDogId),
      // Optimistically remove from likesYou too — if I just responded to someone
      // who liked me, they shouldn't show in the pending list anymore.
      likesYou: s.likesYou.filter((d) => d.id !== targetDogId),
    }));

    try {
      const result = await api.post<SwipeResponse>("/api/swipes", {
        swiper_dog_id: myDogId,
        swiped_dog_id: targetDogId,
        direction,
      });

      return result.matched && result.match ? result.match : null;
    } catch {
      return null;
    }
  },

  fetchMatches: async (myDogId) => {
    try {
      const data = await api.get<Match[]>(`/api/matches?dogId=${myDogId}`);
      const matches = data ?? [];
      set({ matches });
      writeCache("matches", matches);
    } catch {
      // Don't clobber on transient failure (Render cold start) — keep
      // whatever's already shown so the chat list doesn't blank out.
    }
  },

  fetchLikesYou: async (myDogId) => {
    try {
      const data = await api.get<LikedYouDog[]>(`/api/swipes/likes-you?dogId=${myDogId}`);
      const likesYou = data ?? [];
      set({ likesYou });
      writeCache("likesYou", likesYou);
    } catch {}
  },

  // Hydrate matches/likesYou from disk on app startup so the chat list
  // shows immediately instead of empty-while-loading.
  hydrateFromCache: async () => {
    const [matches, likesYou] = await Promise.all([
      readCache<Match[]>("matches"),
      readCache<LikedYouDog[]>("likesYou"),
    ]);
    set((s) => ({
      matches: s.matches.length === 0 && matches ? matches : s.matches,
      likesYou: s.likesYou.length === 0 && likesYou ? likesYou : s.likesYou,
    }));
  },
}));
