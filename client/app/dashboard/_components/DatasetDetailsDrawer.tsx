"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { BarChart3, Download, Settings, Table as TableIcon } from "lucide-react";
import { Dataset, DatasetMetadata } from "@/types/DatasetsTypes";
import { cn } from "@/lib/utils";
import { extractMetadata, formatFileSize, getFileType, typeColors } from "./utils";

interface DatasetDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataset: Dataset | null;
  onPreprocess: () => void;
  onVisualize: () => void;
}

export default function DatasetDetailsDrawer({ open, onOpenChange, dataset, onPreprocess, onVisualize }: DatasetDetailsDrawerProps) {
  const metadata: DatasetMetadata | null = dataset ? extractMetadata(dataset) : null;
  const fileType = getFileType(dataset?.dataset_name || "");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] w-fit mx-auto">
        <div className="mx-auto w-full min-w-4xl overflow-y-auto">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-2xl">{dataset?.dataset_name}</DrawerTitle>
                <DrawerDescription className="mt-2">{metadata?.summary}</DrawerDescription>
              </div>
              <Badge className={typeColors[fileType]} variant="outline">
                {fileType}
              </Badge>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-6">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Rows</CardDescription>
                    <CardTitle className="text-2xl">{metadata?.rows}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Columns</CardDescription>
                    <CardTitle className="text-2xl">{metadata?.columns}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>File Size</CardDescription>
                    <CardTitle className="text-lg">{dataset ? formatFileSize(dataset.file_size) : "-"}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {metadata && metadata.columnNames.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TableIcon className="h-5 w-5" />
                      Column Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {metadata.columnNames.map((col) => (
                        <div key={col} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <span className="font-medium text-sm truncate">{col}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {metadata.columnTypes[col]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {dataset && dataset.data.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Preview</CardTitle>
                    <CardDescription>Showing first 5 rows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {metadata?.columnNames.map((col) => (
                              <th key={col} className="text-left p-2 font-medium">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataset.data.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-b last:border-0">
                              {metadata?.columnNames.map((col) => (
                                <td key={col} className="p-2">
                                  {row[col] === null || row[col] === undefined ? (
                                    <span className="text-muted-foreground italic">null</span>
                                  ) : (
                                    String(row[col])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={onPreprocess} className="flex-1 gap-2" size="lg">
                  <Settings className="h-4 w-4" />
                  Preprocess
                </Button>
                <Button onClick={onVisualize} className="flex-1 gap-2" size="lg" variant="outline">
                  <BarChart3 className="h-4 w-4" />
                  Visualize
                </Button>
                {dataset && (
                  <a
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1 bg-transparent")}
                    href={`${process.env.NEXT_PUBLIC_API_URL}/downloads/${dataset.file_path}`}
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
