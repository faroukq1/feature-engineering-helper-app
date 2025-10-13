"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2, Save } from "lucide-react";

interface FusedDatasetSectionProps {
  fusedData: Record<string, any>[] | null;
  isSaving: boolean;
  onSave: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
}

export default function FusedDatasetSection({ fusedData, isSaving, onSave, onExportCSV, onExportExcel }: FusedDatasetSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fused Dataset</CardTitle>
        <CardDescription>
          {fusedData ? `Preview of merged dataset (${fusedData.length} total rows)` : "Select datasets to begin fusion"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fusedData ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Datasets
                  </>
                )}
              </Button>
              <Button onClick={onExportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button onClick={onExportExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export as Excel
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0">
                    <TableRow>
                      {Object.keys(fusedData[0] || {}).map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fusedData.slice(0, 100).map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((value, cellIdx) => (
                          <TableCell key={cellIdx}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {fusedData.length > 100 && (
                <div className="p-3 border-t text-center text-sm text-muted-foreground">
                  Showing first 100 rows of {fusedData.length} total rows
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">No dataset fused yet</p>
            <p className="text-sm mt-2 text-muted-foreground">Select at least 2 datasets with matching columns to begin</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
