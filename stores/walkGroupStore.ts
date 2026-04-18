import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import type { WalkGroup, WalkGroupMember, WalkGroupMessage } from "../types";

interface WalkGroupWithMembers extends WalkGroup {
  members?: WalkGroupMember[];
}

interface WalkGroupState {
  groups: WalkGroup[];
  currentGroup: WalkGroup | null;
  members: WalkGroupMember[];
  messages: WalkGroupMessage[];
  loading: boolean;

  fetchGroups: () => Promise<void>;
  fetchGroup: (groupId: string) => Promise<void>;
  createGroup: (data: {
    creator_id: string;
    creator_dog_id: string;
    title: string;
    location: string;
    walk_date: string;
    walk_time: string;
    notes: string;
    max_members: number;
  }) => Promise<WalkGroup | null>;
  updateGroup: (groupId: string, updates: Partial<{
    title: string;
    location: string;
    walk_date: string;
    walk_time: string;
    notes: string;
    max_members: number;
  }>) => Promise<WalkGroup | null>;
  joinGroup: (groupId: string, userId: string, dogId: string) => Promise<boolean>;
  leaveGroup: (groupId: string, userId: string) => Promise<void>;
  fetchMembers: (groupId: string) => Promise<void>;
  fetchMessages: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, senderId: string, content: string) => void;
  subscribeToMessages: (groupId: string) => void;
  unsubscribe: () => void;
}

let messageChannel: ReturnType<typeof supabase.channel> | null = null;

export const useWalkGroupStore = create<WalkGroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  members: [],
  messages: [],
  loading: false,

  fetchGroups: async () => {
    set({ loading: true });
    try {
      const data = await api.get<WalkGroup[]>("/api/walks");
      set({ groups: data ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchGroup: async (groupId) => {
    try {
      const data = await api.get<WalkGroupWithMembers>(`/api/walks/${groupId}`);
      if (data) {
        set({ currentGroup: data, members: data.members ?? [] });
      }
    } catch {}
  },

  updateGroup: async (groupId, updates) => {
    try {
      const data = await api.put<WalkGroup>(`/api/walks/${groupId}`, updates);
      if (data) set({ currentGroup: data });
      return data ?? null;
    } catch {
      return null;
    }
  },

  createGroup: async (groupData) => {
    try {
      const data = await api.post<WalkGroup>("/api/walks", groupData);
      return data ?? null;
    } catch {
      return null;
    }
  },

  joinGroup: async (groupId, _userId, dogId) => {
    try {
      await api.post(`/api/walks/${groupId}/join`, { dog_id: dogId });
      await get().fetchMembers(groupId);
      return true;
    } catch {
      return false;
    }
  },

  leaveGroup: async (groupId, _userId) => {
    try {
      await api.delete(`/api/walks/${groupId}/leave`);
      await get().fetchMembers(groupId);
    } catch {}
  },

  fetchMembers: async (groupId) => {
    try {
      const data = await api.get<WalkGroupWithMembers>(`/api/walks/${groupId}`);
      set({ members: data?.members ?? [] });
    } catch {}
  },

  fetchMessages: async (groupId) => {
    try {
      const data = await api.get<WalkGroupMessage[]>(`/api/walks/${groupId}/messages`);
      set({ messages: data ?? [] });
    } catch {}
  },

  sendMessage: (groupId, senderId, content) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic: WalkGroupMessage = {
      id: tempId,
      group_id: groupId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    };

    set((s) => ({ messages: [...s.messages, optimistic] }));

    api
      .post<WalkGroupMessage>(`/api/walks/${groupId}/messages`, { content })
      .then((data) => {
        if (data) {
          set((s) => ({
            messages: s.messages.map((m) => (m.id === tempId ? data : m)),
          }));
        }
      })
      .catch(() => {});
  },

  // Realtime stays on Supabase direct connection
  subscribeToMessages: (groupId) => {
    messageChannel = supabase
      .channel(`walk-group-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "walk_group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new as WalkGroupMessage;
          const existing = get().messages;
          if (existing.some((m) => m.id === newMsg.id)) return;

          const { data } = await supabase
            .from("walk_group_messages")
            .select("*, sender:profiles(*)")
            .eq("id", newMsg.id)
            .single();

          if (data) {
            set((s) => ({
              messages: [...s.messages.filter((m) => !m.id.startsWith("temp-")), data],
            }));
          }
        }
      )
      .subscribe();
  },

  unsubscribe: () => {
    if (messageChannel) {
      supabase.removeChannel(messageChannel);
      messageChannel = null;
    }
  },
}));
