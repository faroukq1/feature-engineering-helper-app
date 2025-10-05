import { Button } from "@/components/ui/button";
import { Code2, Upload } from "lucide-react";
import React from "react";

const OperationHeader = () => {
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
            />
            <Button variant="outline" className="w-[150px] justify-start">
              <Upload className="mr-2 size-4" />
              Import Dataset
            </Button>
          </div>
          <Button variant="outline">
            <Code2 className="mr-2 size-4" />
            View code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OperationHeader;
