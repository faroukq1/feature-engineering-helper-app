import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDatasetStore } from "@/store/useDatasetStore";
import { FileWarning, Loader } from "lucide-react";
import React from "react";

const DisplayDataSet = () => {
  const { data, loading } = useDatasetStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[490px]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Processing file...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-[490px] max-h-[460px] w-full rounded-sm flex flex-col">
      {data.length > 0 ? (
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 w-full overflow-auto border rounded-md min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0]).map((key) => (
                    <TableHead
                      key={key}
                      className="font-semibold bg-background sticky top-0 z-10 min-w-[120px] max-w-[250px]"
                    >
                      <div className="truncate" title={key}>{key}</div>
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
                        className="min-w-[120px] max-w-[250px]"
                      >
                        <div className="truncate" title={String(row[key] ?? "")}>
                          {row[key] !== null && row[key] !== undefined
                            ? String(row[key])
                            : ""}
                        </div>
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
