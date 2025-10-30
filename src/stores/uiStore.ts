import { create } from "zustand";

interface UIState {
  isGlobalLoading: boolean;
  globalError: string | null;
  setGlobalLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoading: false,
  globalError: null,

  setGlobalLoading: (loading: boolean) => set({ isGlobalLoading: loading }),

  setGlobalError: (error: string | null) => set({ globalError: error }),

  clearGlobalError: () => set({ globalError: null }),
}));
