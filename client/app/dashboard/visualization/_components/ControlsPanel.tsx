"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";

export type ChartType =
  | "line"
  | "bar"
  | "scatter"
  | "pie"
  | "histogram"
  | "area"
  | "stackedBar"
  | "stackedArea"
  | "radar"
  | "composed";

interface ControlsPanelProps {
  columns: string[];
  xAxis: string;
  yAxis: string;
  chartType: ChartType;
  showGrid: boolean;
  showLegend: boolean;
  showLabels: boolean;
  onXAxisChange: (v: string) => void;
  onYAxisChange: (v: string) => void;
  onChartTypeChange: (v: ChartType) => void;
  onToggleGrid: (v: boolean) => void;
  onToggleLegend: (v: boolean) => void;
  onToggleLabels: (v: boolean) => void;
  renderActions?: React.ReactNode;
}

export default function ControlsPanel({
  columns,
  xAxis,
  yAxis,
  chartType,
  showGrid,
  showLegend,
  showLabels,
  onXAxisChange,
  onYAxisChange,
  onChartTypeChange,
  onToggleGrid,
  onToggleLegend,
  onToggleLabels,
  renderActions,
}: ControlsPanelProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Visualization Controls</CardTitle>
        <CardDescription>Configure your chart</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>X-Axis</Label>
          <Select value={xAxis} onValueChange={onXAxisChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Y-Axis</Label>
          <Select value={yAxis} onValueChange={onYAxisChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Chart Type</Label>
          <Select value={chartType} onValueChange={(v) => onChartTypeChange(v as ChartType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="histogram">Histogram</SelectItem>
              <SelectItem value="stackedBar">Stacked Bar</SelectItem>
              <SelectItem value="stackedArea">Stacked Area</SelectItem>
              <SelectItem value="radar">Radar Chart</SelectItem>
              <SelectItem value="composed">Composed (Line + Bar)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label>Show Grid</Label>
            <Switch checked={showGrid} onCheckedChange={onToggleGrid} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Legend</Label>
            <Switch checked={showLegend} onCheckedChange={onToggleLegend} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Labels</Label>
            <Switch checked={showLabels} onCheckedChange={onToggleLabels} />
          </div>
        </div>

        {renderActions}
      </CardContent>
    </Card>
  );
}
