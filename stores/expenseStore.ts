import { create } from "zustand";
import { api } from "../lib/api";
import type { DogExpense, ExpenseCategory, ExpenseSummary } from "../types";

interface CreateExpenseInput {
  category_id: string;
  amount: number;
  spent_at?: string;            // YYYY-MM-DD; defaults to today
  merchant?: string;
  notes?: string;
  receipt_photo_url?: string;
  receipt_data?: Record<string, unknown>;
  dog_ids: string[];            // which dogs share this expense
  share_ratios?: number[];      // optional, defaults to even split
  currency?: string;
}

interface ExpenseState {
  expenses: DogExpense[];
  categories: ExpenseCategory[];
  summary: ExpenseSummary | null;
  loading: boolean;

  fetchCategories: () => Promise<void>;
  fetchExpenses: (dogId: string, opts?: { from?: string; to?: string }) => Promise<void>;
  fetchSummary: (dogId: string, year?: number, month?: number) => Promise<void>;
  createExpense: (input: CreateExpenseInput) => Promise<DogExpense | null>;
  deleteExpense: (id: string) => Promise<boolean>;
  createCategory: (input: {
    name: string;
    icon?: string;
    color?: string;
  }) => Promise<ExpenseCategory | null>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  summary: null,
  loading: false,

  fetchCategories: async () => {
    try {
      const data = await api.get<ExpenseCategory[]>("/api/expenses/categories");
      set({ categories: data ?? [] });
    } catch {}
  },

  fetchExpenses: async (dogId, opts) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams({ dogId });
      if (opts?.from) params.set("from", opts.from);
      if (opts?.to) params.set("to", opts.to);
      const data = await api.get<DogExpense[]>(`/api/expenses?${params.toString()}`);
      set({ expenses: data ?? [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchSummary: async (dogId, year, month) => {
    try {
      const params = new URLSearchParams({ dogId });
      if (year) params.set("year", String(year));
      if (month) params.set("month", String(month));
      const data = await api.get<ExpenseSummary>(`/api/expenses/summary?${params.toString()}`);
      set({ summary: data ?? null });
    } catch {}
  },

  createExpense: async (input) => {
    try {
      const created = await api.post<DogExpense>("/api/expenses", input);
      if (created) {
        set((s) => ({ expenses: [created, ...s.expenses] }));
      }
      return created ?? null;
    } catch {
      return null;
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },

  createCategory: async (input) => {
    try {
      const created = await api.post<ExpenseCategory>("/api/expenses/categories", input);
      if (created) {
        set((s) => ({ categories: [...s.categories, created] }));
      }
      return created ?? null;
    } catch {
      return null;
    }
  },
}));
