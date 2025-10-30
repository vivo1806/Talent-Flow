import { create } from "zustand";
import { Job } from "../types/job";
import { useUIStore } from "./uiStore";

interface JobsState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  showArchived: boolean;
  filters: {
    search: string;
    status: string;
    type: string;
  };
  currentPage: number;
  itemsPerPage: number;
  fetchJobs: () => Promise<void>;
  addJob: (
    job: Omit<
      Job,
      "id" | "postedAt" | "status" | "order" | "archived" | "slug"
    >,
  ) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  archiveJob: (id: string) => Promise<void>;
  unarchiveJob: (id: string) => Promise<void>;
  toggleShowArchived: () => void;
  setFilter: (key: string, value: string) => void;
  setPage: (page: number) => void;
  reorderJobs: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  validateSlug: (slug: string, excludeId?: string) => Promise<boolean>;
  retryLastAction: () => Promise<void>;
}

let lastAction: (() => Promise<void>) | null = null;

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,
  showArchived: false,
  filters: {
    search: "",
    status: "all",
    type: "all",
  },
  currentPage: 1,
  itemsPerPage: 10,

  fetchJobs: async () => {
    const action = async () => {
      set({ isLoading: true, error: null });
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch("/api/jobs");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch jobs");
        }

        const jobs = await response.json();
        set({ jobs, isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch jobs";
        set({ error: errorMessage, isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
      }
    };

    lastAction = action;
    await action();
  },

  setFilter: (key: string, value: string) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    }));
  },

  setPage: (page: number) => {
    set({ currentPage: page });
  },

  addJob: async (jobData) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add job");
        }

        const newJob = await response.json();
        set((state) => ({ jobs: [...state.jobs, newJob] }));
        useUIStore.getState().setGlobalLoading(false);
        return newJob;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to add job";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    return await action();
  },

  updateJob: async (id, updates) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/jobs/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update job");
        }

        const updatedJob = await response.json();
        set((state) => ({
          jobs: state.jobs.map((job) => (job.id === id ? updatedJob : job)),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to update job";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    lastAction = action;
    await action();
  },

  deleteJob: async (id) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete job");
        }

        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to delete job";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    lastAction = action;
    await action();
  },

  archiveJob: async (id) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/jobs/${id}/archive`, {
          method: "PATCH",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to archive job");
        }

        const updatedJob = await response.json();
        set((state) => ({
          jobs: state.jobs.map((job) => (job.id === id ? updatedJob : job)),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to archive job";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    lastAction = action;
    await action();
  },

  unarchiveJob: async (id) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/jobs/${id}/unarchive`, {
          method: "PATCH",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to unarchive job");
        }

        const updatedJob = await response.json();
        set((state) => ({
          jobs: state.jobs.map((job) => (job.id === id ? updatedJob : job)),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to unarchive job";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
        throw error;
      }
    };

    lastAction = action;
    await action();
  },

  toggleShowArchived: () => {
    set((state) => ({ showArchived: !state.showArchived }));
  },

  reorderJobs: async (sourceIndex, destinationIndex) => {
    const { jobs } = get();

    const reorderedJobs = Array.from(jobs);
    const [movedJob] = reorderedJobs.splice(sourceIndex, 1);
    reorderedJobs.splice(destinationIndex, 0, movedJob);

    set({ jobs: reorderedJobs });

    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const jobIds = reorderedJobs.map((job) => job.id);
        const response = await fetch("/api/jobs/reorder", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobIds }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to reorder jobs");
        }

        const { jobs: updatedJobs } = await response.json();
        set({ jobs: updatedJobs });
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        set({ jobs, error: "Failed to reorder jobs. Changes reverted." });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore
          .getState()
          .setGlobalError("Failed to reorder jobs. Changes reverted.");
        console.error("Reorder error:", error);
      }
    };

    lastAction = action;
    await action();
  },

  validateSlug: async (slug: string, excludeId?: string) => {
    try {
      const excludeParam = excludeId ? `&excludeId=${excludeId}` : "";
      const response = await fetch(
        `/api/jobs/validate-slug?slug=${encodeURIComponent(slug)}${excludeParam}`,
      );
      const { isValid } = await response.json();
      return isValid;
    } catch (error) {
      console.error("Slug validation error:", error);
      return true;
    }
  },

  retryLastAction: async () => {
    if (lastAction) {
      useUIStore.getState().clearGlobalError();
      await lastAction();
    }
  },
}));
