"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";

interface ExportButtonsProps {
  onExportPNG: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
}

export default function ExportButtons({ onExportPNG, onExportCSV, onExportExcel }: ExportButtonsProps) {
  return (
    <div className="space-y-2 pt-4">
      <Button onClick={onExportPNG} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Export Chart (PNG)
      </Button>
      <Button onClick={onExportCSV} variant="outline" className="w-full bg-transparent">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button onClick={onExportExcel} variant="outline" className="w-full bg-transparent">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
}
