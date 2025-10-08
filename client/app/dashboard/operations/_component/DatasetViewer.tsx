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
        <DisplayDataSet data={data} fileName={fileName} />

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
