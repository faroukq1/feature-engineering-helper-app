"use client";

import { Dataset } from "@/types/DatasetsTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type DatasetStore = {
  mode: string;
  data: any[];
  datasets: Dataset[];
  visualizeDataset: Dataset | null;
  selectedDataset: Dataset | null;
  selectedDatasets: Dataset[];
  fileName: string;
  loading: boolean;

  setMode: (mode: string) => void;
  setData: (data: any[]) => void;
  setDatasets: (datasets: Dataset[]) => void;
  setVisualizeDataset: (dataset: Dataset) => void;
  setSelectedDataset: (dataset: Dataset | null) => void;
  setSelectedDatasets: (datasets: Dataset[]) => void;
  addSelectedDataset: (dataset: Dataset) => void;
  removeSelectedDataset: (dataset: Dataset) => void;
  clearSelectedDatasets: () => void;
  updateSelectedDataset: (updatedDataset: Dataset) => void;
  setFileName: (fileName: string) => void;
  setLoading: (loading: boolean) => void;
  clearDataset: () => void;
};

export const useDatasetStore = create<DatasetStore>()(
  persist(
    (set) => ({
      mode: "Data Set",
      data: [],
      datasets: [],
      visualizeDataset: null,
      selectedDataset: null,
      selectedDatasets: [],
      fileName: "",
      loading: false,

      setMode: (mode) => set({ mode }),
      setData: (data) => set({ data }),
      setDatasets: (datasets) => set({ datasets }),
      setVisualizeDataset: (dataset) => set({ visualizeDataset: dataset }),
      setSelectedDataset: (dataset) => set({ selectedDataset: dataset }),
      setSelectedDatasets: (datasets) => set({ selectedDatasets: datasets }),
      addSelectedDataset: (dataset) =>
        set((state) => ({
          selectedDatasets: [...state.selectedDatasets, dataset],
        })),
      removeSelectedDataset: (dataset) =>
        set((state) => ({
          selectedDatasets: state.selectedDatasets.filter(
            (d) => d.file_id !== dataset.file_id
          ),
        })),
      clearSelectedDatasets: () => set({ selectedDatasets: [] }),
      updateSelectedDataset: (updatedDataset) =>
        set((state) => ({
          selectedDataset:
            state.selectedDataset?.file_id === updatedDataset.file_id
              ? updatedDataset
              : state.selectedDataset,
          datasets: state.datasets.map((d) =>
            d.file_id === updatedDataset.file_id ? updatedDataset : d
          ),
        })),
      setFileName: (fileName) => set({ fileName }),
      setLoading: (loading) => set({ loading }),
      clearDataset: () => set({ data: [], fileName: "" }),
    }),
    {
      name: "dataset-store",
      // Only persist small, essential data to avoid quota issues
      partialize: (state) => ({
        mode: state.mode,
        fileName: state.fileName,
        loading: state.loading,
        // Don't persist large datasets, selectedDataset, or selectedDatasets
        // These will be loaded fresh from the server when needed
      }),
    }
  )
);
