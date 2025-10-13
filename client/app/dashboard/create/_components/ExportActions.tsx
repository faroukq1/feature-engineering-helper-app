"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportActionsProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

export default function ExportActions({ onExportCSV, onExportExcel, disabled }: ExportActionsProps) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg border p-6 sm:flex-row">
      <div className="flex-1">
        <h3 className="font-semibold">Export Dataset</h3>
        <p className="text-sm">Download your dataset in CSV or Excel format</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onExportCSV} disabled={disabled} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export as CSV
        </Button>
        <Button onClick={onExportExcel} disabled={disabled}>
          <Download className="mr-2 h-4 w-4" />
          Export as Excel
        </Button>
      </div>
    </div>
  );
}
