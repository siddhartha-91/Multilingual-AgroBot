import { create } from "zustand";

interface DiagnosisState {
  result: any | null;
  setResult: (data: any) => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  result: null,
  setResult: (data) => set({ result: data }),
}));
