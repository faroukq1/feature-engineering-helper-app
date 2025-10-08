import { Button } from "@/components/ui/button";
import { parseCSV } from "@/lib/utils";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import React from "react";
import { useDatasetStore } from "@/store/useDatasetStore";

const OperationHeader = () => {
  const { setData, setFileName } = useDatasetStore();
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setFileName(file.name);

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;

        try {
          const parsedData = parseCSV(text);
          setData(parsedData);
        } catch (error) {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV: " + error);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Error reading file");
      };

      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;

          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(worksheet);

          const filteredData = json.filter((row: any) => {
            const values = Object.values(row);
            return values.some(
              (val) => val !== null && val !== undefined && val !== ""
            );
          });

          setData(filteredData);
        } catch (error) {
          alert("Error parsing Excel file: " + error);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Error reading file");
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
    }
  };
  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operations</h1>
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
