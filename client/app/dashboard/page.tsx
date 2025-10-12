"use client";

import type React from "react";
import { shell } from "electron";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Upload,
  Plus,
  Calendar,
  Database,
  Download,
  Eye,
  Loader2,
  Table,
  Settings,
  BarChart3,
  GitMerge,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Dataset, DatasetMetadata } from "@/types/DatasetsTypes";
import { useDatasetStore } from "@/store/useDatasetStore";

const typeColors = {
  CSV: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Excel: "bg-green-500/10 text-green-500 border-green-500/20",
  JSON: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const getFileType = (filename: string): "CSV" | "Excel" | "JSON" => {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "csv") return "CSV";
  if (ext === "xlsx" || ext === "xls") return "Excel";
  return "JSON";
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const extractMetadata = (dataset: Dataset): DatasetMetadata => {
  const rows = dataset.data.length;
  const columns = rows > 0 ? Object.keys(dataset.data[0]).length : 0;
  const columnNames = rows > 0 ? Object.keys(dataset.data[0]) : [];

  // Infer column types from first row
  const columnTypes: Record<string, string> = {};
  if (rows > 0) {
    columnNames.forEach((col) => {
      const value = dataset.data[0][col];
      if (value === null || value === undefined) {
        columnTypes[col] = "unknown";
      } else if (typeof value === "number") {
        columnTypes[col] = "number";
      } else if (typeof value === "boolean") {
        columnTypes[col] = "boolean";
      } else if (!isNaN(Date.parse(value))) {
        columnTypes[col] = "date";
      } else {
        columnTypes[col] = "string";
      }
    });
  }

  const summary = `Dataset with ${rows} rows and ${columns} columns`;

  return { rows, columns, columnNames, columnTypes, summary };
};

export default function DashboardPage() {
  const { 
    datasets, 
    setDatasets, 
    visualizeDataset, 
    setVisualizeDataset,
    selectedDataset: globalSelectedDataset,
    setSelectedDataset: setGlobalSelectedDataset
  } = useDatasetStore();
  const [localSelectedDataset, setLocalSelectedDataset] = useState<Dataset | null>(null);
  const [selectedMetadata, setSelectedMetadata] =
    useState<DatasetMetadata | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") as string);
        if (!user?.id) {
          console.error("No user found in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user-files/${user.id}`
        );
        setDatasets(response.data);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFiles();
  }, []);

  const handleCardClick = (dataset: Dataset) => {
    setLocalSelectedDataset(dataset);
    setGlobalSelectedDataset(dataset);
    setSelectedMetadata(extractMetadata(dataset));
    setIsDrawerOpen(true);
  };

  const handleVisualize = () => {
    if (localSelectedDataset) {
      router.push("/dashboard/visualization");
      setVisualizeDataset(localSelectedDataset);
      setIsDrawerOpen(false);
    }
  };

  const handlePreprocess = () => {
    if (localSelectedDataset) {
      router.push("/dashboard/operations");
      setIsDrawerOpen(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const dataset_name = file.name;

    setIsUploading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") as string);
      if (!user?.id) {
        alert("Please log in to upload datasets");
        return;
      }

      // First, convert file to JSON
      const formData = new FormData();
      formData.append("file", file);

      const jsonifyResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/jsonify-dataset`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Then save the dataset
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/save-json-dataset`, {
        user_id: user.id,
        dataset_name: dataset_name,
        data: jsonifyResponse.data,
      });

      // Refresh the datasets list
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user-files/${user.id}`
      );
      setDatasets(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading or processing file");
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleDownload = async () => {
    if (!localSelectedDataset) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${localSelectedDataset.download_url}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", localSelectedDataset.dataset_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    }
  };

  return (
    <div className="w-full bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Datasets Dashboard</h1>
          </div>
          <Button
            className="relative gap-2 overflow-hidden"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Dataset
              </>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.json"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage and visualize your datasets. Click on any card to view
            details.
          </p>
          <Button
            onClick={() => router.push("/dashboard/fusion")}
            variant="outline"
            className="gap-2"
          >
            <GitMerge className="h-4 w-4" />
            Fuse Datasets
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No datasets yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first dataset to get started
            </p>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {datasets.map((dataset, index) => {
              const metadata = extractMetadata(dataset);
              return (
                <motion.div
                  key={dataset.file_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleCardClick(dataset)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {dataset.dataset_name}
                          </CardTitle>
                          <CardDescription className="mt-1.5">
                            {metadata.summary}
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            typeColors[getFileType(dataset.dataset_name)]
                          }
                          variant="outline"
                        >
                          {getFileType(dataset.dataset_name)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rows</span>
                          <span className="font-medium">{metadata.rows}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Columns</span>
                          <span className="font-medium">
                            {metadata.columns}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-2 border-t">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(dataset.upload_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Dataset Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh] w-fit mx-auto">
          <div className="mx-auto w-full min-w-4xl overflow-y-auto">
            <DrawerHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DrawerTitle className="text-2xl">
                    {localSelectedDataset?.dataset_name}
                  </DrawerTitle>
                  <DrawerDescription className="mt-2">
                    {selectedMetadata?.summary}
                  </DrawerDescription>
                </div>
                <Badge
                  className={
                    typeColors[getFileType(localSelectedDataset?.dataset_name || "")]
                  }
                  variant="outline"
                >
                  {getFileType(localSelectedDataset?.dataset_name || "")}
                </Badge>
              </div>
            </DrawerHeader>

            <div className="px-4 pb-6">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Rows</CardDescription>
                      <CardTitle className="text-2xl">
                        {selectedMetadata?.rows}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Columns</CardDescription>
                      <CardTitle className="text-2xl">
                        {selectedMetadata?.columns}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>File Size</CardDescription>
                      <CardTitle className="text-lg">
                        {localSelectedDataset &&
                          formatFileSize(localSelectedDataset.file_size)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {selectedMetadata &&
                  selectedMetadata.columnNames.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Table className="h-5 w-5" />
                          Column Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {selectedMetadata.columnNames.map((col) => (
                            <div
                              key={col}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                            >
                              <span className="font-medium text-sm truncate">
                                {col}
                              </span>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {selectedMetadata.columnTypes[col]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {localSelectedDataset && localSelectedDataset.data.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Data Preview</CardTitle>
                      <CardDescription>Showing first 5 rows</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {selectedMetadata?.columnNames.map((col) => (
                                <th
                                  key={col}
                                  className="text-left p-2 font-medium"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {localSelectedDataset.data
                              .slice(0, 5)
                              .map((row, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b last:border-0"
                                >
                                  {selectedMetadata?.columnNames.map((col) => (
                                    <td key={col} className="p-2">
                                      {row[col] === null ||
                                      row[col] === undefined ? (
                                        <span className="text-muted-foreground italic">
                                          null
                                        </span>
                                      ) : (
                                        String(row[col])
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handlePreprocess}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Settings className="h-4 w-4" />
                    Preprocess
                  </Button>
                  <Button
                    onClick={handleVisualize}
                    className="flex-1 gap-2"
                    size="lg"
                    variant="outline"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Visualize
                  </Button>
                  <a
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "flex-1 bg-transparent"
                    )}
                    href={`${process.env.NEXT_PUBLIC_API_URL}/downloads/${localSelectedDataset?.file_path}`}
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
