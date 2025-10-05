import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileWarning } from "lucide-react";
import React, { useState } from "react";

const DatasetViewer = () => {
  const [mode, setMode] = useState("complete");
  const handleSubmit = () => {
    console.log("Submitting:");
  };
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex h-full flex-col space-y-4">
        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="Data Set">
              <p className="flex items-center gap-2">
                <Database />
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

        {/* dataset placeholder */}
        <div className="border min-h-[490px] w-full rounded-sm flex items-center justify-center">
          <p className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <FileWarning className="h-6 w-6 text-muted-foreground" />
            <span className="text-base font-semibold text-foreground">
              No dataset selected
            </span>
            <span>Please choose a dataset file (CSV or Excel).</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
};

export default DatasetViewer;
