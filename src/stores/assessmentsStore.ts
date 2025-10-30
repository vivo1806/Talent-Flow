import { create } from "zustand";
import { Assessment } from "../types/job";
import { useUIStore } from "./uiStore";

interface AssessmentsState {
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
  fetchAssessments: () => Promise<void>;
  fetchAssessmentByJobId: (jobId: string) => Promise<Assessment | null>;
  createAssessment: (
    assessment: Omit<Assessment, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Assessment>;
  updateAssessment: (id: string, updates: Partial<Assessment>) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  retryLastAction: () => Promise<void>;
}

let lastAction: (() => Promise<void>) | null = null;

export const useAssessmentsStore = create<AssessmentsState>((set) => ({
  assessments: [],
  isLoading: false,
  error: null,

  fetchAssessments: async () => {
    const action = async () => {
      set({ isLoading: true, error: null });
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch("/api/assessments");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch assessments");
        }

        const assessments = await response.json();
        set({ assessments, isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to fetch assessments";
        set({ error: errorMessage, isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
      }
    };

    lastAction = action;
    await action();
  },

  fetchAssessmentByJobId: async (jobId: string) => {
    set({ isLoading: true, error: null });
    useUIStore.getState().setGlobalLoading(true);

    try {
      const response = await fetch(`/api/assessments/job/${jobId}`);
      if (response.status === 404) {
        set({ isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch assessment");
      }

      const assessment = await response.json();
      set({ isLoading: false });
      useUIStore.getState().setGlobalLoading(false);
      return assessment;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch assessment";
      set({ error: errorMessage, isLoading: false });
      useUIStore.getState().setGlobalLoading(false);
      useUIStore.getState().setGlobalError(errorMessage);
      return null;
    }
  },

  createAssessment: async (assessmentData) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create assessment");
        }

        const newAssessment = await response.json();
        set((state) => ({
          assessments: [...state.assessments, newAssessment],
        }));
        useUIStore.getState().setGlobalLoading(false);
        return newAssessment;
      } catch (error: any) {
        set({ error: error.message });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(error.message);
        throw error;
      }
    };

    return await action();
  },

  updateAssessment: async (id, updates) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/assessments/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update assessment");
        }

        const updatedAssessment = await response.json();
        set((state) => ({
          assessments: state.assessments.map((assessment) =>
            assessment.id === id ? updatedAssessment : assessment,
          ),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to update assessment";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
      }
    };

    lastAction = action;
    await action();
  },

  deleteAssessment: async (id) => {
    const action = async () => {
      useUIStore.getState().setGlobalLoading(true);

      try {
        const response = await fetch(`/api/assessments/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete assessment");
        }

        set((state) => ({
          assessments: state.assessments.filter(
            (assessment) => assessment.id !== id,
          ),
        }));
        useUIStore.getState().setGlobalLoading(false);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to delete assessment";
        set({ error: errorMessage });
        useUIStore.getState().setGlobalLoading(false);
        useUIStore.getState().setGlobalError(errorMessage);
      }
    };

    lastAction = action;
    await action();
  },

  retryLastAction: async () => {
    if (lastAction) {
      useUIStore.getState().clearGlobalError();
      await lastAction();
    }
  },
}));
