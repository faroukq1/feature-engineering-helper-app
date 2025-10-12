import { Button } from "@/components/ui/button";
import { Upload, Database } from "lucide-react";
import axios from "axios";
import React, { useEffect } from "react";
import { useDatasetStore } from "@/store/useDatasetStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const OperationHeader = () => {
  const { setData, setFileName, setLoading, selectedDataset } =
    useDatasetStore();

  // Load selected dataset when component mounts
  useEffect(() => {
    if (selectedDataset) {
      setData(selectedDataset.data);
      setFileName(selectedDataset.dataset_name);
    } else {
      // If no selected dataset, try to load from localStorage as fallback
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.id) {
        // You could add a function to fetch the most recent dataset here
        console.log(
          "No selected dataset found, please select one from the dashboard"
        );
      }
    }
  }, [selectedDataset, setData, setFileName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/jsonify-dataset`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setData(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading or processing file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Operations</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              id="dataset-upload"
              type="file"
              accept=".csv, .xlsx, .xls"
              className="absolute inset-0 z-10 h-full cursor-pointer opacity-0"
              onChange={handleFileUpload}
            />
            <Button variant="outline" className="w-[150px] justify-start">
              <Upload className="mr-2 size-4" />
              Import Dataset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationHeader;
