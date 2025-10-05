"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  RotateCcw,
  Share2,
  MoreHorizontal,
  Save,
  Database,
  Upload,
  FileWarning,
} from "lucide-react";
import OperationHeader from "./_component/OperationHeader";
import DatasetViewer from "./_component/DatasetViewer";
import DatasetOperations from "./_component/DatasetOperations";

export default function OperationsPage() {
  return (
    <div className="flex flex-col w-full">
      <OperationHeader />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <DatasetViewer />
        {/* Right Side - Settings */}
        <DatasetOperations />
      </div>
    </div>
  );
}
