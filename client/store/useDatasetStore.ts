"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DatasetStore = {
  mode: string;
  data: any[];
  fileName: string;

  setMode: (mode: string) => void;
  setData: (data: any[]) => void;
  setFileName: (fileName: string) => void;
  clearDataset: () => void;
};

export const useDatasetStore = create<DatasetStore>()(
  persist(
    (set) => ({
      mode: "Data Set",
      data: [],
      fileName: "",

      setMode: (mode) => set({ mode }),
      setData: (data) => set({ data }),
      setFileName: (fileName) => set({ fileName }),
      clearDataset: () => set({ data: [], fileName: "" }),
    }),
    {
      name: "dataset-store",
    }
  )
);
