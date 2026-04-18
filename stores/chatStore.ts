import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import type { Message } from "../types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ChatState {
  messages: Message[];
  lastMessages: Record<string, Message>;
  channel: RealtimeChannel | null;
  fetchMessages: (matchId: string) => Promise<void>;
  fetchLastMessages: (matchIds: string[]) => Promise<void>;
  sendMessage: (matchId: string, senderId: string, content: string) => Promise<void>;
  subscribeToMessages: (matchId: string) => void;
  unsubscribe: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  lastMessages: {},
  channel: null,

  fetchMessages: async (matchId) => {
    try {
      const data = await api.get<Message[]>(`/api/chat/${matchId}/messages`);
      set({ messages: data ?? [] });
    } catch {}
  },

  fetchLastMessages: async (matchIds) => {
    if (matchIds.length === 0) return;

    const results: Record<string, Message> = {};
    await Promise.all(
      matchIds.map(async (matchId) => {
        try {
          const data = await api.get<Message>(`/api/chat/${matchId}/messages/last`);
          if (data) results[matchId] = data;
        } catch {}
      })
    );

    set({ lastMessages: results });
  },

  sendMessage: async (matchId, senderId, content) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      match_id: matchId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, optimistic] }));

    try {
      const data = await api.post<Message>(`/api/chat/${matchId}/messages`, { content });
      if (data) {
        set((s) => ({
          messages: s.messages.map((m) => (m.id === tempId ? data : m)),
          lastMessages: { ...s.lastMessages, [matchId]: data },
        }));
      }
    } catch {}
  },

  // Realtime stays on Supabase direct connection
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
        (payload) => {
          const newMsg = payload.new as Message;
          set((s) => {
            if (s.messages.some((m) => m.id === newMsg.id)) return s;
            return {
              messages: [...s.messages, newMsg],
              lastMessages: { ...s.lastMessages, [matchId]: newMsg },
            };
          });
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
