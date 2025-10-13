"use client";

import { Database } from "lucide-react";

export default function FusionHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Fuse Datasets</h1>
      </div>
      <p className="text-muted-foreground">
        Select multiple datasets from your collection and merge them into one dataset
      </p>
    </div>
  );
}
