"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye } from "lucide-react";
import { Dataset } from "@/types/DatasetsTypes";

interface DatasetSelectGridProps {
  datasets: Dataset[];
  selectedIds: Set<string>;
  onToggle: (dataset: Dataset) => void;
  onPreview: (dataset: Dataset) => void;
  getDatasetColumns: (d: Dataset) => string[];
}

export default function DatasetSelectGrid({ datasets, selectedIds, onToggle, onPreview, getDatasetColumns }: DatasetSelectGridProps) {
  if (datasets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No datasets available</h3>
        <p className="text-muted-foreground">Upload some datasets first to use the fusion feature</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => {
        const isSelected = selectedIds.has(dataset.file_id);
        const columns = getDatasetColumns(dataset);

        return (
          <div
            key={dataset.file_id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => onToggle(dataset)}
          >
            <div className="flex items-start gap-3">
              <Checkbox checked={!!isSelected} onChange={() => onToggle(dataset)} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{dataset.dataset_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {dataset.data.length} rows × {columns.length} columns
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {columns.length} columns
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onPreview(dataset); }}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
