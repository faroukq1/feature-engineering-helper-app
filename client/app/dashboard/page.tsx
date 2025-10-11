"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Upload, Plus, Calendar, Database, FileText, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock dataset data
const mockDatasets = [
  {
    id: "1",
    name: "sales_data.csv",
    rows: 1250,
    columns: 8,
    uploadDate: "2024-01-15",
    summary:
      "Contains quarterly sales data with revenue and product information",
    type: "CSV",
    fileSize: "245 KB",
    columnDetails: [
      { name: "id", type: "number" },
      { name: "date", type: "date" },
      { name: "product", type: "string" },
      { name: "revenue", type: "number" },
      { name: "quantity", type: "number" },
      { name: "region", type: "string" },
      { name: "customer_id", type: "number" },
      { name: "discount", type: "number" },
    ],
  },
  {
    id: "2",
    name: "employee_salaries.xlsx",
    rows: 450,
    columns: 6,
    uploadDate: "2024-01-18",
    summary:
      "Contains employee salary data with department and position details",
    type: "Excel",
    fileSize: "128 KB",
    columnDetails: [
      { name: "employee_id", type: "number" },
      { name: "name", type: "string" },
      { name: "department", type: "string" },
      { name: "position", type: "string" },
      { name: "salary", type: "number" },
      { name: "hire_date", type: "date" },
    ],
  },
  {
    id: "3",
    name: "customer_feedback.json",
    rows: 3200,
    columns: 5,
    uploadDate: "2024-01-20",
    summary: "Customer feedback and ratings from various channels",
    type: "JSON",
    fileSize: "512 KB",
    columnDetails: [
      { name: "feedback_id", type: "number" },
      { name: "customer_name", type: "string" },
      { name: "rating", type: "number" },
      { name: "comment", type: "string" },
      { name: "date", type: "date" },
    ],
  },
  {
    id: "4",
    name: "inventory_tracking.csv",
    rows: 890,
    columns: 7,
    uploadDate: "2024-01-22",
    summary: "Real-time inventory levels across multiple warehouses",
    type: "CSV",
    fileSize: "178 KB",
    columnDetails: [
      { name: "product_id", type: "number" },
      { name: "product_name", type: "string" },
      { name: "warehouse", type: "string" },
      { name: "quantity", type: "number" },
      { name: "reorder_level", type: "number" },
      { name: "last_updated", type: "date" },
      { name: "supplier", type: "string" },
    ],
  },
  {
    id: "5",
    name: "marketing_campaigns.xlsx",
    rows: 156,
    columns: 9,
    uploadDate: "2024-01-25",
    summary: "Marketing campaign performance metrics and ROI analysis",
    type: "Excel",
    fileSize: "95 KB",
    columnDetails: [
      { name: "campaign_id", type: "number" },
      { name: "campaign_name", type: "string" },
      { name: "start_date", type: "date" },
      { name: "end_date", type: "date" },
      { name: "budget", type: "number" },
      { name: "impressions", type: "number" },
      { name: "clicks", type: "number" },
      { name: "conversions", type: "number" },
      { name: "roi", type: "number" },
    ],
  },
  {
    id: "6",
    name: "website_analytics.json",
    rows: 5600,
    columns: 10,
    uploadDate: "2024-01-28",
    summary: "Website traffic and user behavior analytics data",
    type: "JSON",
    fileSize: "1.2 MB",
    columnDetails: [
      { name: "session_id", type: "string" },
      { name: "user_id", type: "string" },
      { name: "page_url", type: "string" },
      { name: "timestamp", type: "date" },
      { name: "duration", type: "number" },
      { name: "device", type: "string" },
      { name: "browser", type: "string" },
      { name: "location", type: "string" },
      { name: "referrer", type: "string" },
      { name: "bounce", type: "boolean" },
    ],
  },
];

const typeColors = {
  CSV: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Excel: "bg-green-500/10 text-green-500 border-green-500/20",
  JSON: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function page() {
  const [selectedDataset, setSelectedDataset] = useState<
    (typeof mockDatasets)[0] | null
  >(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const handleCardClick = (dataset: (typeof mockDatasets)[0]) => {
    setSelectedDataset(dataset);
    setIsDrawerOpen(true);
  };

  const handleVisualize = () => {
    if (selectedDataset) {
      router.push(`/visualize?dataset=${selectedDataset.id}`);
      setIsDrawerOpen(false);
    }
  };

  const handleUpload = () => {
    router.push("/");
  };

  return (
    <div className="w-full bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Datasets Dashboard</h1>
          </div>
          <Button onClick={handleUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Dataset
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 md:px-6">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Manage and visualize your datasets. Click on any card to view
            details.
          </p>
        </div>

        {/* Dataset Grid */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {mockDatasets.map((dataset, index) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleCardClick(dataset)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {dataset.name}
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {dataset.summary}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        typeColors[dataset.type as keyof typeof typeColors]
                      }
                      variant="outline"
                    >
                      {dataset.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>
                          {dataset.rows.toLocaleString()} rows ×{" "}
                          {dataset.columns} cols
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(dataset.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Floating Add Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Button
          size="lg"
          onClick={handleUpload}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Dataset Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DrawerTitle className="text-2xl">
                    {selectedDataset?.name}
                  </DrawerTitle>
                  <DrawerDescription className="mt-2">
                    {selectedDataset?.summary}
                  </DrawerDescription>
                </div>
                <Badge
                  className={
                    typeColors[selectedDataset?.type as keyof typeof typeColors]
                  }
                  variant="outline"
                >
                  {selectedDataset?.type}
                </Badge>
              </div>
            </DrawerHeader>

            <div className="px-4 pb-6">
              <div className="space-y-6">
                {/* Metadata Section */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Rows</CardDescription>
                      <CardTitle className="text-2xl">
                        {selectedDataset?.rows.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Columns</CardDescription>
                      <CardTitle className="text-2xl">
                        {selectedDataset?.columns}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>File Size</CardDescription>
                      <CardTitle className="text-2xl">
                        {selectedDataset?.fileSize}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Upload Date</CardDescription>
                      <CardTitle className="text-lg">
                        {selectedDataset &&
                          new Date(
                            selectedDataset.uploadDate
                          ).toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Column Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Column Details</CardTitle>
                    <CardDescription>
                      Data types and column names
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedDataset?.columnDetails.map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border p-3 text-sm"
                        >
                          <span className="font-medium">{col.name}</span>
                          <Badge variant="secondary">{col.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleVisualize}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Eye className="h-4 w-4" />
                    Visualize Dataset
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    size="lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
