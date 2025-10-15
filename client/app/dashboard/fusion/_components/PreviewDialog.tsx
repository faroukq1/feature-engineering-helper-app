"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dataset } from "@/types/DatasetsTypes";

interface PreviewDialogProps {
  open: boolean;
  dataset: Dataset | null;
  getColumns: (d: Dataset) => string[];
  onOpenChange: (open: boolean) => void;
}

export default function PreviewDialog({ open, dataset, getColumns, onOpenChange }: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dataset?.dataset_name}</DialogTitle>
          <DialogDescription>Preview of first 10 rows</DialogDescription>
        </DialogHeader>
        {dataset && (
          <div className="border rounded-lg overflow-hidden">
            <div className="w-full max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {getColumns(dataset).map((column) => (
                      <TableHead key={column} className="min-w-[120px] max-w-[250px]">
                        <div className="truncate" title={column}>{column}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.data.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx}>
                      {getColumns(dataset).map((column) => (
                        <TableCell key={column} className="min-w-[120px] max-w-[250px]">
                          <div className="truncate" title={String(row[column])}>{String(row[column])}</div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
