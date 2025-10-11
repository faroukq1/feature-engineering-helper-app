"use client";

import type React from "react";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ParsedCSV {
  id: string;
  name: string;
  rows: number;
  columns: string[];
  data: Record<string, any>[];
}

export default function page() {
  const [files, setFiles] = useState<ParsedCSV[]>([]);
  const [fusedData, setFusedData] = useState<Record<string, any>[] | null>(
    null
  );
  const [previewFile, setPreviewFile] = useState<ParsedCSV | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setError("Please upload only CSV files");
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, any>[];
          const columns = results.meta.fields || [];

          const parsedFile: ParsedCSV = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            rows: data.length,
            columns,
            data,
          };

          setFiles((prev) => [...prev, parsedFile]);
          setError(null);
        },
        error: (error) => {
          setError(`Error parsing ${file.name}: ${error.message}`);
        },
      });
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setFusedData(null);
    setError(null);
  };

  const canFuse = (): boolean => {
    if (files.length < 2) return false;

    const firstColumns = files[0].columns.sort().join(",");
    return files.every(
      (file) => file.columns.sort().join(",") === firstColumns
    );
  };

  const fuseFiles = () => {
    if (!canFuse()) {
      setError("All CSVs must have identical columns to be fused");
      return;
    }

    const merged = files.flatMap((file) => file.data);
    setFusedData(merged);
    setError(null);
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
    <div className="w-full text-white p-8">
      <div className="space-y-8">
        <div className="text-black dark:text-white">
          <h1 className="text-3xl font-bold mb-2">Fuse Datasets</h1>
          <p>Upload multiple CSV files and merge them into one dataset</p>
        </div>

        {/* Top Section - Upload & File Management */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV Files</CardTitle>
            <CardDescription>
              Drag and drop CSV files or click to select. All files must have
              identical columns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
              <p className="text-lg mb-2">Drag and drop CSV files here</p>
              <p className="text-sm mb-4">or</p>
              <label htmlFor="file-upload">
                <Button variant="outline">Select Files</Button>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-950/50 border border-red-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {files.length >= 2 && columnsMatch && (
              <div className="flex items-center gap-2 p-4 bg-green-950/50 border border-green-900 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-green-400">
                  All files have matching columns and can be fused
                </p>
              </div>
            )}

            {files.length >= 2 && !columnsMatch && (
              <div className="flex items-center gap-2 p-4 bg-yellow-950/50 border border-yellow-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <p className="text-yellow-400">
                  Column mismatch detected. All CSVs must have identical
                  columns.
                </p>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Uploaded Files ({files.length})
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm">
                          {file.rows} rows × {file.columns.length} columns
                        </p>
                        <p className="text-xs mt-1">
                          Columns: {file.columns.join(", ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewFile(file)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fuse Button */}
            {files.length >= 2 && (
              <Button
                onClick={fuseFiles}
                disabled={!columnsMatch}
                className="w-full disabled:cursor-not-allowed"
              >
                Fuse Files
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
                : "Upload CSV files to begin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fusedData ? (
              <div className="space-y-4">
                {/* Export Buttons */}
                <div className="flex gap-3">
                  <Button onClick={exportToCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button onClick={exportToExcel}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>

                {/* Data Table */}
                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader className="bg-zinc-900 sticky top-0">
                        <TableRow className="border-zinc-800 hover:bg-zinc-900">
                          {Object.keys(fusedData[0] || {}).map((column) => (
                            <TableHead
                              key={column}
                              className="text-zinc-300 font-semibold"
                            >
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fusedData.slice(0, 100).map((row, idx) => (
                          <TableRow
                            key={idx}
                            className="border-zinc-800 hover:bg-zinc-900/50"
                          >
                            {Object.values(row).map((value, cellIdx) => (
                              <TableCell
                                key={cellIdx}
                                className="text-zinc-300"
                              >
                                {String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {fusedData.length > 100 && (
                    <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-center text-sm text-zinc-400">
                      Showing first 100 rows of {fusedData.length} total rows
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No dataset fused yet</p>
                <p className="text-sm mt-2">
                  Upload at least 2 CSV files with matching columns to begin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {previewFile?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preview of first 10 rows
            </DialogDescription>
          </DialogHeader>
          {previewFile && (
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="bg-zinc-900 sticky top-0">
                    <TableRow className="border-zinc-800 hover:bg-zinc-900">
                      {previewFile.columns.map((column) => (
                        <TableHead
                          key={column}
                          className="text-zinc-300 font-semibold"
                        >
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewFile.data.slice(0, 10).map((row, idx) => (
                      <TableRow
                        key={idx}
                        className="border-zinc-800 hover:bg-zinc-900/50"
                      >
                        {previewFile.columns.map((column) => (
                          <TableCell key={column} className="text-zinc-300">
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
