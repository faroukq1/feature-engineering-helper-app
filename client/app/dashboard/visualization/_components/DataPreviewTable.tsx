"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataPreviewTableProps {
  columns: string[];
  dataset: any[];
}

export default function DataPreviewTable({ columns, dataset }: DataPreviewTableProps) {
  if (dataset.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
        <CardDescription>First 10 rows of your dataset</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full max-h-[500px] overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="min-w-[120px] max-w-[250px]">
                    <div className="truncate" title={col}>{col}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataset.slice(0, 10).map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col} className="min-w-[120px] max-w-[250px]">
                      <div className="truncate" title={row[col]?.toString() || "-"}>{row[col]?.toString() || "-"}</div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
