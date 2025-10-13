"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Dataset } from "@/types/DatasetsTypes";
import { extractMetadata, getFileType, typeColors } from "./utils";

interface DatasetCardProps {
  dataset: Dataset;
  onClick: (dataset: Dataset) => void;
}

export default function DatasetCard({ dataset, onClick }: DatasetCardProps) {
  const metadata = extractMetadata(dataset);
  const fileType = getFileType(dataset.dataset_name);

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      onClick={() => onClick(dataset)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{dataset.dataset_name}</CardTitle>
            <CardDescription className="mt-1.5">{metadata.summary}</CardDescription>
          </div>
          <Badge className={typeColors[fileType]} variant="outline">
            {fileType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rows</span>
            <span className="font-medium">{metadata.rows}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Columns</span>
            <span className="font-medium">{metadata.columns}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-2 border-t">
            <Calendar className="h-4 w-4" />
            <span>{new Date(dataset.upload_date).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
