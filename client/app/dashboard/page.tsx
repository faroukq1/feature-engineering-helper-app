"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Dataset, DatasetMetadata } from "@/types/DatasetsTypes";
import { useDatasetStore } from "@/store/useDatasetStore";
import { TopBar, DatasetGrid, DatasetDetailsDrawer } from "./_components";
import EmptyState from "@/components/global/EmptyState";
import LoadingState from "@/components/global/LoadingState";

export default function DashboardPage() {
  const { 
    datasets, 
    setDatasets, 
    setVisualizeDataset,
    setSelectedDataset: setGlobalSelectedDataset
  } = useDatasetStore();
  const [localSelectedDataset, setLocalSelectedDataset] = useState<Dataset | null>(null);
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

  return (
    <div className="w-full bg-background">
      <TopBar
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onGoFusion={() => router.push("/dashboard/fusion")}
      />

      <main className="px-4 py-8 md:px-6">
        {isLoading ? (
          <LoadingState />
        ) : datasets.length === 0 ? (
          <EmptyState />
        ) : (
          <DatasetGrid datasets={datasets} onCardClick={(d) => handleCardClick(d)} />
        )}
      </main>

      <DatasetDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        dataset={localSelectedDataset}
        onPreprocess={handlePreprocess}
        onVisualize={handleVisualize}
      />
    </div>
  );
}
