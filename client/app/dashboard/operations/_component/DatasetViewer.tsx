import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, CheckCircle, AlertCircle } from "lucide-react";
import DisplayDataSet from "./DisplayDataSet";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useState } from "react";

const DatasetViewer = () => {
  const { mode, setMode, data, fileName, clearDataset, selectedDataset } =
    useDatasetStore();
  const [hasProcessedData, setHasProcessedData] = useState(false);

  // Check if we have processed data (different from original)
  const isDataProcessed =
    data.length > 0 &&
    selectedDataset &&
    JSON.stringify(data) !== JSON.stringify(selectedDataset.data);

  const handleSubmit = () => {
    console.log("Submitting data:", data);
    // This will be handled by the DatasetOperations component
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex h-full flex-col space-y-4">
        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="w-1/3">
            <TabsTrigger value="Data Set">
              <p className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {`Data Set (${fileName ? fileName : "empty"})`}
              </p>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status Indicator */}
        {isDataProcessed && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Data has been processed. Review the changes and click "Submit
              Changes" to save.
            </span>
          </div>
        )}

        {/* Dataset Display Component */}
        <DisplayDataSet />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {data.length > 0 && (
            <Button variant="outline" onClick={() => clearDataset()}>
              Clear Dataset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetViewer;
