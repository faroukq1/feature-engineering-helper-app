"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DatasetStore = {
  mode: string;
  data: any[];
  fileName: string;
  loading: boolean;

  setMode: (mode: string) => void;
  setData: (data: any[]) => void;
  setFileName: (fileName: string) => void;
  setLoading: (loading: boolean) => void;
  clearDataset: () => void;
};

export const useDatasetStore = create<DatasetStore>()(
  persist(
    (set) => ({
      mode: "Data Set",
      data: [],
      fileName: "",
      loading: false,

      setMode: (mode) => set({ mode }),
      setData: (data) => set({ data }),
      setFileName: (fileName) => set({ fileName }),
      setLoading: (loading) => set({ loading }),
      clearDataset: () => set({ data: [], fileName: "" }),
    }),
    {
      name: "dataset-store",
    }
  )
);
