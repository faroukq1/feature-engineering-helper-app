import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDatasetStore } from "@/store/useDatasetStore";
import { FileWarning } from "lucide-react";
import React from "react";

interface DisplayDataSetProps {
  data: any[];
  fileName: string;
}

const DisplayDataSet = () => {
  const { data } = useDatasetStore();
  return (
    <div className="min-h-[490px] max-h-[490px] w-full rounded-sm flex flex-col">
      {data.length > 0 ? (
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-auto border rounded-md min-h-0">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0]).map((key) => (
                    <TableHead
                      key={key}
                      className="whitespace-nowrap font-semibold bg-background sticky top-0 z-10"
                    >
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 50).map((row, i) => (
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
          </div>
          {data.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-3 flex-shrink-0">
              Showing 50 of {data.length} rows
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground text-center max-w-md mx-auto h-full">
          <FileWarning className="h-6 w-6 text-muted-foreground" />
          <span className="text-base font-semibold text-foreground">
            No dataset loaded
          </span>
          <span>Select a CSV or Excel file from your computer.</span>
        </div>
      )}
    </div>
  );
};

export default DisplayDataSet;
