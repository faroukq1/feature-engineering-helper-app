"use client";

import type React from "react";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Download,
  Database,
  Loader2,
  Save,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import axios from "axios";
import { useDatasetStore } from "@/store/useDatasetStore";
import { Dataset } from "@/types/DatasetsTypes";

export default function FusionPage() {
  const { 
    datasets, 
    setDatasets, 
    selectedDatasets, 
    setSelectedDatasets,
    addSelectedDataset,
    removeSelectedDataset,
    clearSelectedDatasets
  } = useDatasetStore();
  
  const [fusedData, setFusedData] = useState<Record<string, any>[] | null>(null);
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDatasetToggle = (dataset: Dataset) => {
    if (selectedDatasets.find(d => d.file_id === dataset.file_id)) {
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

    const firstColumns = getDatasetColumns(selectedDatasets[0]).sort().join(",");
    return selectedDatasets.every(
      (dataset) => getDatasetColumns(dataset).sort().join(",") === firstColumns
    );
  };

  const fuseDatasets = () => {
    if (!canFuse()) {
      setError("All datasets must have identical columns to be fused");
      return;
    }

    const merged = selectedDatasets.flatMap((dataset) => dataset.data);
    setFusedData(merged);
    setError(null);
  };

  const saveFusedDataset = async () => {
    if (!fusedData) return;

    setIsSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") as string);
      if (!user?.id) {
        alert("Please log in to save datasets");
        return;
      }

      const datasetName = `fused-dataset-${new Date().toISOString().split('T')[0]}`;
      
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
      
      alert("Fused dataset saved successfully!");
    } catch (error) {
      console.error("Error saving fused dataset:", error);
      alert("Error saving fused dataset");
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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Fuse Datasets</h1>
          </div>
          <p className="text-muted-foreground">
            Select multiple datasets from your collection and merge them into one dataset
          </p>
        </div>

        {/* Dataset Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Datasets</CardTitle>
            <CardDescription>
              Choose multiple datasets to fuse. All datasets must have identical columns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {datasets.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No datasets available</h3>
                <p className="text-muted-foreground">
                  Upload some datasets first to use the fusion feature
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {datasets.map((dataset) => {
                  const isSelected = selectedDatasets.find(d => d.file_id === dataset.file_id);
                  const columns = getDatasetColumns(dataset);
                  
                  return (
                    <div
                      key={dataset.file_id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleDatasetToggle(dataset)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={!!isSelected}
                          onChange={() => handleDatasetToggle(dataset)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{dataset.dataset_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {dataset.data.length} rows × {columns.length} columns
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {columns.length} columns
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDataset(dataset);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {selectedDatasets.length >= 2 && columnsMatch && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-green-600">
                  All selected datasets have matching columns and can be fused
                </p>
              </div>
            )}

            {selectedDatasets.length >= 2 && !columnsMatch && (
              <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-600">
                  Column mismatch detected. All datasets must have identical columns.
                </p>
              </div>
            )}

            {/* Selected Datasets Summary */}
            {selectedDatasets.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Selected Datasets ({selectedDatasets.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDatasets.map((dataset) => (
                    <Badge key={dataset.file_id} variant="secondary" className="gap-2">
                      {dataset.dataset_name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSelectedDataset(dataset)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Fuse Button */}
            {selectedDatasets.length >= 2 && (
              <Button
                onClick={fuseDatasets}
                disabled={!columnsMatch}
                className="w-full"
              >
                Fuse Datasets
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Bottom Section - Fused Dataset Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Fused Dataset</CardTitle>
            <CardDescription>
              {fusedData
                ? `Preview of merged dataset (${fusedData.length} total rows)`
                : "Select datasets to begin fusion"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fusedData ? (
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={saveFusedDataset} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save to Datasets
                      </>
                    )}
                  </Button>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button onClick={exportToExcel} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>

                {/* Data Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0">
                        <TableRow>
                          {Object.keys(fusedData[0] || {}).map((column) => (
                            <TableHead key={column}>
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fusedData.slice(0, 100).map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((value, cellIdx) => (
                              <TableCell key={cellIdx}>
                                {String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {fusedData.length > 100 && (
                    <div className="p-3 border-t text-center text-sm text-muted-foreground">
                      Showing first 100 rows of {fusedData.length} total rows
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg">No dataset fused yet</p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Select at least 2 datasets with matching columns to begin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewDataset} onOpenChange={() => setPreviewDataset(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewDataset?.dataset_name}
            </DialogTitle>
            <DialogDescription>
              Preview of first 10 rows
            </DialogDescription>
          </DialogHeader>
          {previewDataset && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0">
                    <TableRow>
                      {getDatasetColumns(previewDataset).map((column) => (
                        <TableHead key={column}>
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewDataset.data.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        {getDatasetColumns(previewDataset).map((column) => (
                          <TableCell key={column}>
                            {String(row[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
