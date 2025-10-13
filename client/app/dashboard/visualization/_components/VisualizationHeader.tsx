"use client";

import { LineChartIcon } from "lucide-react";

interface VisualizationHeaderProps {
  datasetName?: string | null;
}

export default function VisualizationHeader({ datasetName }: VisualizationHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <LineChartIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Dataset Visualization</h1>
        {datasetName ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>•</span>
            <span>Visualizing: {datasetName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <span>•</span>
            <span>No dataset selected - please select one from the dashboard</span>
          </div>
        )}
      </div>
      <p className="text-muted-foreground">
        {datasetName ? "Explore your selected dataset visually" : "Upload and explore your data visually"}
      </p>
    </div>
  );
}
