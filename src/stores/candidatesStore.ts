import { create } from "zustand";
import { Candidate, Note } from "../types/job";
import { useUIStore } from "./uiStore";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CandidatesState {
  candidates: Candidate[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
  };
  fetchCandidates: (page?: number) => Promise<void>;
  updateCandidateStatus: (
    id: string,
    status: Candidate["status"],
  ) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  addNote: (
    candidateId: string,
    text: string,
    mentions: string[],
  ) => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  retryLastAction: () => Promise<void>;
}

let lastAction: (() => Promise<void>) | null = null;

const CURRENT_USER = "John Doe";

export const useCandidatesStore = create<CandidatesState>((set, get) => ({
  candidates: [],
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
  },

  fetchCandidates: async (page = 1) => {
    const action = async () => {
      set({ isLoading: true, error: null });
      useUIStore.getState().setGlobalLoading(true);

      try {
        const { filters } = get();
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "50",
          search: filters.search || "",
          status: filters.status || "all",
        });

        const response = await fetch(`/api/candidates?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch candidates");
        }

        const { data, pagination } = await response.json();
        set({ candidates: data, pagination, isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch candidates";
        set({ error: errorMessage, isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
      }
    };

    lastAction = action;
    await action();
  },

  updateCandidateStatus: async (id, status) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/candidates/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to update candidate status",
          );
        }

        const updatedCandidate = await response.json();
        set((state) => ({
          candidates: state.candidates.map((candidate) =>
            candidate.id === id ? updatedCandidate : candidate,
          ),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage =
          error.message || "Failed to update candidate status";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    lastAction = action;
    await action();
  },

  deleteCandidate: async (id) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/candidates/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete candidate");
        }

        set((state) => ({
          candidates: state.candidates.filter(
            (candidate) => candidate.id !== id,
          ),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to delete candidate";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    lastAction = action;
    await action();
  },

  addNote: async (candidateId: string, text: string, mentions: string[]) => {
    try {
      const newNote: Note = {
        id: crypto.randomUUID(),
        candidateId,
        text,
        mentions,
        createdBy: CURRENT_USER,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const savedNote = await response.json();

      set((state) => ({
        candidates: state.candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, notes: [...(candidate.notes || []), savedNote] }
            : candidate,
        ),
      }));
    } catch (error: any) {
      console.error("Failed to add note:", error);
      useUIStore.getState().setGlobalError("Failed to add note");
      throw error;
    }
  },

  setSearch: (search: string) => {
    set((state) => ({
      filters: { ...state.filters, search },
    }));
  },

  setStatusFilter: (status: string) => {
    set((state) => ({
      filters: { ...state.filters, status },
    }));
  },

  retryLastAction: async () => {
    if (lastAction) {
      useUIStore.getState().clearGlobalError();
      await lastAction();
    }
  },
}));
