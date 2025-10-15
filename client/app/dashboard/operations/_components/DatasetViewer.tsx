import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";
import { DisplayDataSet } from ".";
import { useDatasetStore } from "@/store/useDatasetStore";

const DatasetViewer = () => {
  const { mode, setMode, data, fileName, clearDataset } =
    useDatasetStore();

  return (
    <div className="flex flex-col p-6 h-full">
      <div className="flex h-full flex-col space-y-4">
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

        <DisplayDataSet />

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
