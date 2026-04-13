import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Message } from "../types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ChatState {
  messages: Message[];
  channel: RealtimeChannel | null;
  fetchMessages: (matchId: string) => Promise<void>;
  sendMessage: (matchId: string, senderId: string, content: string) => Promise<void>;
  subscribeToMessages: (matchId: string) => void;
  unsubscribe: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  channel: null,

  fetchMessages: async (matchId) => {
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles(*)")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    set({ messages: data ?? [] });
  },

  sendMessage: async (matchId, senderId, content) => {
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: senderId,
      content,
    });
  },

  subscribeToMessages: (matchId) => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          const { data: newMsg } = await supabase
            .from("messages")
            .select("*, sender:profiles(*)")
            .eq("id", payload.new.id)
            .single();

          if (newMsg) {
            set((s) => ({ messages: [...s.messages, newMsg] }));
          }
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null, messages: [] });
    }
  },
}));
