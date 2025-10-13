"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import React from "react";

interface UploadPanelProps {
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
}

export default function UploadPanel({ onDrop, onDragOver, onClick, fileInputRef, onFileSelect, fileName }: UploadPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
        <CardDescription>Drag and drop or click to upload a CSV file</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={onClick}
          className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">{fileName || "Drop your CSV file here or click to browse"}</p>
          <p className="text-sm text-muted-foreground">Supports CSV files only</p>
          <Input ref={fileInputRef} type="file" accept=".csv" onChange={onFileSelect} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}
