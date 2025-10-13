"use client";

import { Button } from "@/components/ui/button";
import { GitMerge, Loader2, Upload } from "lucide-react";

interface TopBarProps {
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGoFusion: () => void;
}

export default function TopBar({ isUploading, onFileChange, onGoFusion }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Datasets Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onGoFusion} variant="outline" className="gap-2">
            <GitMerge className="h-4 w-4" />
            Fuse Datasets
          </Button>
          <Button className="relative gap-2 overflow-hidden" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Dataset
              </>
            )}
            <input
              type="file"
              onChange={onFileChange}
              accept=".csv,.xlsx,.xls,.json"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
