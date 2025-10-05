import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileWarning, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import React, { useState } from "react";

const DatasetViewer = () => {
  const [mode, setMode] = useState("Data Set");
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) return [];

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || "";
        // Try to convert to number if possible
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });

      // Only add row if it has at least one non-empty value
      if (
        Object.values(row).some(
          (v) => v !== "" && v !== null && v !== undefined
        )
      ) {
        rows.push(row);
      }
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("=== FILE UPLOAD STARTED ===");
    console.log("File name:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.type);

    setFileName(file.name);

    if (file.name.endsWith(".csv")) {
      console.log("Processing CSV file...");
      const reader = new FileReader();

      reader.onload = (event) => {
        console.log("FileReader onload triggered");
        const text = event.target?.result as string;
        console.log("CSV text length:", text?.length);
        console.log("First 200 characters:", text?.substring(0, 200));

        try {
          const parsedData = parseCSV(text);
          console.log("Parsed data:", parsedData);
          console.log("Number of rows:", parsedData.length);
          console.log("First row:", parsedData[0]);

          setData(parsedData);
          console.log("Data state updated");
        } catch (error) {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV: " + error);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Error reading file");
      };

      console.log("Starting to read file as text...");
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      console.log("Processing Excel file...");
      const reader = new FileReader();

      reader.onload = (event) => {
        console.log("FileReader onload triggered for Excel");
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          console.log("ArrayBuffer size:", arrayBuffer?.byteLength);

          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          console.log("Workbook sheets:", workbook.SheetNames);

          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(worksheet);

          console.log("Raw Excel data:", json);
          console.log("Excel data length:", json.length);

          const filteredData = json.filter((row: any) => {
            const values = Object.values(row);
            return values.some(
              (val) => val !== null && val !== undefined && val !== ""
            );
          });

          console.log("Filtered Excel data:", filteredData);
          console.log("Filtered Excel data length:", filteredData.length);

          setData(filteredData);
          console.log("Data state updated");
        } catch (error) {
          console.error("Error parsing Excel:", error);
          alert("Error parsing Excel file: " + error);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Error reading file");
      };

      console.log("Starting to read file as array buffer...");
      reader.readAsArrayBuffer(file);
    } else {
      console.log("Invalid file type");
      alert("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
    }
  };

  const handleSubmit = () => {
    console.log("=== SUBMIT CLICKED ===");
    console.log("Submitting data:", data);
    console.log("Number of rows:", data.length);
  };

  console.log("Component rendering, data length:", data.length);

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

        {/* Dataset Section */}
        <div className="border min-h-[490px] w-full rounded-sm flex items-center justify-center p-4 overflow-auto">
          {data.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <div className="mb-3 text-sm text-muted-foreground">
                Loaded:{" "}
                <span className="font-medium text-foreground">{fileName}</span>{" "}
                ({data.length} rows)
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map((key) => (
                      <TableHead
                        key={key}
                        className="whitespace-nowrap font-semibold"
                      >
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 20).map((row, i) => (
                    <TableRow key={i}>
                      {Object.keys(data[0]).map((key) => (
                        <TableCell
                          key={`${i}-${key}`}
                          className="whitespace-nowrap"
                        >
                          {row[key] !== null && row[key] !== undefined
                            ? String(row[key])
                            : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.length > 20 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing 20 of {data.length} rows
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground text-center max-w-md">
              <FileWarning className="h-6 w-6 text-muted-foreground" />
              <span className="text-base font-semibold text-foreground">
                No dataset loaded
              </span>
              <span>Select a CSV or Excel file from your computer.</span>

              <div className="w-full space-y-2">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    console.log("=== FILE INPUT CHANGE EVENT ===");
                    console.log("Event:", e);
                    console.log("Target:", e.target);
                    console.log("Files:", e.target.files);
                    console.log("Files length:", e.target.files?.length);
                    handleFileUpload(e);
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: CSV, XLSX, XLS
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={data.length === 0}>
            Submit
          </Button>
          {data.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                console.log("Clear button clicked");
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
