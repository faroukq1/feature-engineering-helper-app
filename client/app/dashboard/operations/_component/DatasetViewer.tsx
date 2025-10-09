import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";
import DisplayDataSet from "./DisplayDataSet";
import { useDatasetStore } from "@/store/useDatasetStore";

const DatasetViewer = () => {
  const { mode, setMode, data, fileName, clearDataset } = useDatasetStore();
  const handleSubmit = () => {
    console.log("Submitting data:", data);
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
                {`Data Set (${fileName})`}
              </p>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Dataset Display Component */}
        <DisplayDataSet />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={data.length === 0}>
            Submit
          </Button>
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
