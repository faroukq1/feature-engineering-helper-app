import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";
import * as XLSX from "xlsx";
import React, { useState } from "react";
import { parseCSV } from "@/lib/utils";
import DisplayDataSet from "./DisplayDataSet";

const DatasetViewer = () => {
  const [mode, setMode] = useState("Data Set");
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");

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

  const handleSubmit = () => {
    console.log("Submitting data:", data);
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex h-full flex-col space-y-4">
        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="Data Set">
              <p className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Set
              </p>
            </TabsTrigger>
            <TabsTrigger value="insert">
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Insert
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Dataset Display Component */}
        <DisplayDataSet
          data={data}
          fileName={fileName}
          onFileUpload={handleFileUpload}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={data.length === 0}>
            Submit
          </Button>
          {data.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setData([]);
                setFileName("");
              }}
            >
              Clear Dataset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetViewer;
