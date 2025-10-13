"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dataset } from "@/types/DatasetsTypes";

interface SelectedDatasetsChipsProps {
  selected: Dataset[];
  onRemove: (dataset: Dataset) => void;
}

export default function SelectedDatasetsChips({ selected, onRemove }: SelectedDatasetsChipsProps) {
  if (selected.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Selected Datasets ({selected.length})</h3>
      <div className="flex flex-wrap gap-2">
        {selected.map((dataset) => (
          <Badge key={dataset.file_id} variant="secondary" className="gap-2">
            {dataset.dataset_name}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onRemove(dataset)}
            >
              ×
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
