import { create } from "zustand";
import { api } from "../lib/api";
import type {
  HealthRecord,
  HealthRecordType,
  HealthReminder,
  LatestWeight,
} from "../types";

interface CreateHealthRecordInput {
  dog_id: string;
  type_code: string;
  recorded_at?: string;          // defaults to today server-side
  title?: string;
  numeric_value?: number | null;
  notes?: string;
  document_url?: string;
  metadata?: Record<string, unknown>;
  next_due_at?: string | null;
}

interface HealthState {
  records: HealthRecord[];
  types: HealthRecordType[];
  reminders: HealthReminder[];
  latestWeight: LatestWeight | null;
  loading: boolean;

  fetchTypes: () => Promise<void>;
  fetchRecords: (dogId: string, typeCode?: string) => Promise<void>;
  fetchReminders: (withinDays?: number) => Promise<void>;
  fetchLatestWeight: (dogId: string) => Promise<void>;
  createRecord: (input: CreateHealthRecordInput) => Promise<HealthRecord | null>;
  deleteRecord: (id: string) => Promise<boolean>;
}

export const useHealthStore = create<HealthState>((set) => ({
  records: [],
  types: [],
  reminders: [],
  latestWeight: null,
  loading: false,

  fetchTypes: async () => {
    try {
      const data = await api.get<HealthRecordType[]>("/api/health/types");
      set({ types: data ?? [] });
    } catch {}
  },

  fetchRecords: async (dogId, typeCode) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams({ dogId });
      if (typeCode) params.set("type", typeCode);
      const data = await api.get<HealthRecord[]>(`/api/health?${params.toString()}`);
      set({ records: data ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchReminders: async (withinDays) => {
    try {
      const params = new URLSearchParams();
      if (withinDays) params.set("withinDays", String(withinDays));
      const qs = params.toString();
      const data = await api.get<HealthReminder[]>(
        `/api/health/reminders${qs ? `?${qs}` : ""}`
      );
      set({ reminders: data ?? [] });
    } catch {}
  },

  fetchLatestWeight: async (dogId) => {
    try {
      const data = await api.get<LatestWeight | null>(
        `/api/health/latest-weight?dogId=${dogId}`
      );
      set({ latestWeight: data ?? null });
    } catch {}
  },

  createRecord: async (input) => {
    try {
      const created = await api.post<HealthRecord>("/api/health", input);
      if (created) {
        set((s) => ({ records: [created, ...s.records] }));
      }
      return created ?? null;
    } catch {
      return null;
    }
  },

  deleteRecord: async (id) => {
    try {
      await api.delete(`/api/health/${id}`);
      set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },
}));
