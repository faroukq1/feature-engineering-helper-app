"use client";

import { Database } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">No datasets yet</h3>
      <p className="text-muted-foreground mb-4">Upload your first dataset to get started</p>
    </div>
  );
}
