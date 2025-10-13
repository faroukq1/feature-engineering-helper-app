"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import axios from "axios";
import { useDatasetStore } from "@/store/useDatasetStore";
import { Dataset } from "@/types/DatasetsTypes";
import { useToast } from "@/hooks/use-toast";
import { FusionHeader, DatasetSelectGrid, StatusMessages, SelectedDatasetsChips, FuseButton, FusedDatasetSection, PreviewDialog } from "./_components";

export default function FusionPage() {
  const {
    datasets,
    setDatasets,
    selectedDatasets,
    setSelectedDatasets,
    addSelectedDataset,
    removeSelectedDataset,
    clearSelectedDatasets,
  } = useDatasetStore();

  const [fusedData, setFusedData] = useState<Record<string, any>[] | null>(
    null
  );
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const { toast } = useToast();

  // Load user datasets when component mounts
  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") as string);
        if (!user?.id) {
          console.error("No user found in localStorage");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user-files/${user.id}`
        );
        setDatasets(response.data);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      }
    };

    fetchUserFiles();
  }, [setDatasets]);

  const handleDatasetToggle = (dataset: Dataset) => {
    if (selectedDatasets.find((d) => d.file_id === dataset.file_id)) {
      removeSelectedDataset(dataset);
    } else {
      addSelectedDataset(dataset);
    }
    setFusedData(null);
    setError(null);
  };

  const getDatasetColumns = (dataset: Dataset): string[] => {
    if (dataset.data.length === 0) return [];
    return Object.keys(dataset.data[0]);
  };

  const canFuse = (): boolean => {
    if (selectedDatasets.length < 2) return false;

    const firstColumns = getDatasetColumns(selectedDatasets[0])
      .sort()
      .join(",");
    return selectedDatasets.every(
      (dataset) => getDatasetColumns(dataset).sort().join(",") === firstColumns
    );
  };

  const fuseDatasets = async () => {
    if (selectedDatasets.length < 2) return;
    setIsLoading(true);
    setError(null);
    setDiagnostics([]);
    try {
      const user = JSON.parse(localStorage.getItem("user") as string);
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to fuse datasets.",
        });
        return;
      }

      const file_ids = selectedDatasets.map((d) => d.file_id);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/fuse-datasets`,
        {
          user_id: user.id,
          file_ids,
        }
      );

      if (res.data?.can_fuse) {
        setFusedData(res.data.data || []);
        setDiagnostics(res.data.diagnostics || []);
        setError(null);
        toast({
          variant: "success",
          title: "Fusion Completed",
          description: `Fused ${file_ids.length} datasets. Rows: ${res.data.row_count}`,
        });
      } else {
        const issues: string[] = res.data?.diagnostics || [];
        setDiagnostics(issues);
        setFusedData(null);
        setError(
          issues.length > 0
            ? issues[0]
            : "Datasets cannot be fused due to schema mismatch"
        );
      }
    } catch (e) {
      setFusedData(null);
      setDiagnostics([]);
      setError("Error while fusing datasets");
      console.error(e);
      toast({
        variant: "destructive",
        title: "Fusion Failed",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFusedDataset = async () => {
    if (!fusedData) return;

    setIsSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") as string);
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to save datasets.",
        });
        return;
      }

      const datasetName = `fused-dataset-${
        new Date().toISOString().split("T")[0]
      }`;

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/save-json-dataset`, {
        user_id: user.id,
        dataset_name: datasetName,
        data: fusedData,
      });

      // Refresh the datasets list
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user-files/${user.id}`
      );
      setDatasets(response.data);

      // Clear selections and fused data
      clearSelectedDatasets();
      setFusedData(null);

      toast({
        variant: "success",
        title: "Fused Dataset Saved Successfully",
        description: "Your fused dataset has been saved to your collection.",
      });
    } catch (error) {
      console.error("Error saving fused dataset:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Fused Dataset",
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!fusedData) return;

    const csv = Papa.unparse(fusedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fused-dataset.csv";
    link.click();
  };

  const exportToExcel = () => {
    if (!fusedData) return;

    const worksheet = XLSX.utils.json_to_sheet(fusedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fused Data");
    XLSX.writeFile(workbook, "fused-dataset.xlsx");
  };

  const columnsMatch = canFuse();

  return (
    <div className="w-full bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <FusionHeader />

        {/* Dataset Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Datasets</CardTitle>
            <CardDescription>
              Choose multiple datasets to fuse. All datasets must have identical columns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DatasetSelectGrid
              datasets={datasets}
              selectedIds={new Set(selectedDatasets.map((d) => d.file_id))}
              onToggle={handleDatasetToggle}
              onPreview={setPreviewDataset}
              getDatasetColumns={getDatasetColumns}
            />

            <StatusMessages
              error={error}
              diagnostics={diagnostics}
              columnsMatch={columnsMatch}
              selectedCount={selectedDatasets.length}
            />

            <SelectedDatasetsChips
              selected={selectedDatasets}
              onRemove={removeSelectedDataset}
            />

            <FuseButton
              canShow={selectedDatasets.length >= 2}
              isLoading={isLoading}
              onClick={fuseDatasets}
            />
          </CardContent>
        </Card>

        {/* Bottom Section - Fused Dataset Preview */}
        <FusedDatasetSection
          fusedData={fusedData}
          isSaving={isSaving}
          onSave={saveFusedDataset}
          onExportCSV={exportToCSV}
          onExportExcel={exportToExcel}
        />
      </div>

      {/* Preview Modal */}
      <PreviewDialog
        open={!!previewDataset}
        dataset={previewDataset}
        getColumns={getDatasetColumns}
        onOpenChange={(open) => !open && setPreviewDataset(null)}
      />
    </div>
  );
}
