import { create } from "zustand";
import { api } from "../lib/api";
import type { Dog, Match } from "../types";
import { sortCandidates } from "../lib/tagSort";

interface SwipeResponse {
  matched: boolean;
  match?: Match;
}

interface MatchState {
  candidates: Dog[];
  matches: Match[];
  loadingCandidates: boolean;
  fetchCandidates: (myDogId: string, myDog?: Dog) => Promise<void>;
  swipe: (myDogId: string, targetDogId: string, direction: "like" | "pass") => Promise<Match | null>;
  fetchMatches: (myDogId: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set) => ({
  candidates: [],
  matches: [],
  loadingCandidates: false,

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
      set({ matches: data ?? [] });
    } catch {}
  },
}));
