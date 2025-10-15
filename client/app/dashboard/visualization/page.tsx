"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChartIcon } from "lucide-react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import * as XLSX from "xlsx";
import { useDatasetStore } from "@/store/useDatasetStore";
import {
  VisualizationHeader,
  UploadPanel,
  ControlsPanel,
  ExportButtons,
  ChartCard,
  DataPreviewTable,
} from "./_components";

type ChartType =
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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function VisualizePage() {
  const { visualizeDataset, selectedDataset, datasets } = useDatasetStore();
  const [dataset, setDataset] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Load dataset from store: visualizeDataset -> selectedDataset -> first of datasets
  useEffect(() => {
    const source =
      visualizeDataset ??
      selectedDataset ??
      (datasets && datasets.length > 0 ? datasets[0] : null);

    if (source && source.data && source.data.length > 0) {
      setDataset(source.data);
      setFileName(source.dataset_name);
      const cols = Object.keys(source.data[0] || {});
      setColumns(cols);
      if (cols.length > 0) setXAxis(cols[0]);
      if (cols.length > 1) setYAxis(cols[1]);
    }
  }, [visualizeDataset, selectedDataset, datasets]);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setDataset(results.data);
          const cols = Object.keys(results.data[0] as any);
          setColumns(cols);
          if (cols.length > 0) setXAxis(cols[0]);
          if (cols.length > 1) setYAxis(cols[1]);

          // Auto-scroll to chart controls
          setTimeout(() => {
            chartRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(dataset);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(".csv", "")}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataset);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${fileName.replace(".csv", "")}_export.xlsx`);
  };

  const exportChartAsPNG = () => {
    const chartElement = document.querySelector(".recharts-wrapper");
    if (!chartElement) return;

    // Create a canvas and draw the chart
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgElement = chartElement.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `chart_${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
        }
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const prepareChartData = () => {
    if (!xAxis || !yAxis || dataset.length === 0) return [];

    if (chartType === "histogram") {
      const values = dataset
        .map((row) => Number(row[yAxis]))
        .filter((v) => !isNaN(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = 10;
      const binSize = (max - min) / binCount;

      const bins = Array.from({ length: binCount }, (_, i) => ({
        range: `${(min + i * binSize).toFixed(1)}-${(
          min +
          (i + 1) * binSize
        ).toFixed(1)}`,
        count: 0,
      }));

      values.forEach((value) => {
        const binIndex = Math.min(
          Math.floor((value - min) / binSize),
          binCount - 1
        );
        bins[binIndex].count++;
      });

      return bins;
    }

    if (
      chartType === "stackedBar" ||
      chartType === "stackedArea" ||
      chartType === "radar"
    ) {
      const numericColumns = columns.filter((col) => {
        const firstValue = dataset[0][col];
        return typeof firstValue === "number" || !isNaN(Number(firstValue));
      });

      return dataset.map((row) => {
        const dataPoint: any = { [xAxis]: row[xAxis] };
        numericColumns.forEach((col) => {
          dataPoint[col] = Number(row[col]) || 0;
        });
        return dataPoint;
      });
    }

    return dataset.map((row) => ({
      [xAxis]: row[xAxis],
      [yAxis]: Number(row[yAxis]) || 0,
    }));
  };

  const renderChart = () => {
    const data = prepareChartData();
    if (data.length === 0) return null;

    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    const gridColor = "hsl(var(--border))";
    const axisColor = "hsl(var(--muted-foreground))";
    const tooltipStyle = {
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      color: "hsl(var(--popover-foreground))",
    };

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={yAxis}
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={showLabels}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Bar dataKey={yAxis} fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis dataKey={yAxis} stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Scatter name={yAxis} data={data} fill={COLORS[2]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.slice(0, 10)}
                dataKey={yAxis}
                nameKey={xAxis}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={showLabels}
              >
                {data.slice(0, 10).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case "histogram":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey="range" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Bar dataKey="count" fill={COLORS[4]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey={yAxis}
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "stackedBar":
        const numericCols = columns.filter((col) => {
          const firstValue = dataset[0]?.[col];
          return typeof firstValue === "number" || !isNaN(Number(firstValue));
        });
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              {numericCols.slice(0, 5).map((col, idx) => (
                <Bar
                  key={col}
                  dataKey={col}
                  stackId="a"
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "stackedArea":
        const numericColsArea = columns.filter((col) => {
          const firstValue = dataset[0]?.[col];
          return typeof firstValue === "number" || !isNaN(Number(firstValue));
        });
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              {numericColsArea.slice(0, 5).map((col, idx) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stackId="1"
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "radar":
        const radarData = data.slice(0, 10);
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey={xAxis} stroke={axisColor} />
              <PolarRadiusAxis stroke={axisColor} />
              <Radar
                name={yAxis}
                dataKey={yAxis}
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
              />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case "composed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              )}
              <XAxis dataKey={xAxis} stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Bar dataKey={yAxis} fill={COLORS[1]} />
              <Line
                type="monotone"
                dataKey={yAxis}
                stroke={COLORS[0]}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="w-full bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <VisualizationHeader
          datasetName={visualizeDataset?.dataset_name ?? null}
        />

        {/* File Upload Section - Only show if no dataset is selected */}
        {!visualizeDataset && (
          <UploadPanel
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            fileName={fileName}
          />
        )}
        {/* Visualization Section */}
        {dataset.length > 0 && (
          <div ref={chartRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <ControlsPanel
              columns={columns}
              xAxis={xAxis}
              yAxis={yAxis}
              chartType={chartType}
              showGrid={showGrid}
              showLegend={showLegend}
              showLabels={showLabels}
              onXAxisChange={setXAxis}
              onYAxisChange={setYAxis}
              onChartTypeChange={setChartType}
              onToggleGrid={setShowGrid}
              onToggleLegend={setShowLegend}
              onToggleLabels={setShowLabels}
              renderActions={
                <ExportButtons
                  onExportPNG={exportChartAsPNG}
                  onExportCSV={exportToCSV}
                  onExportExcel={exportToExcel}
                />
              }
            />

            <ChartCard
              title="Visualization"
              description={`${
                chartType.charAt(0).toUpperCase() + chartType.slice(1)
              } chart of ${yAxis} vs ${xAxis}`}
            >
              {renderChart()}
            </ChartCard>
          </div>
        )}

        {/* Empty State */}
        {dataset.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <LineChartIcon className="h-24 w-24 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-muted-foreground">
                  Upload a dataset to begin visualizing
                </h3>
                <p className="text-muted-foreground">
                  Drop a CSV file above to start exploring your data with
                  interactive charts
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Data Preview */}
        {dataset.length > 0 && (
          <DataPreviewTable columns={columns} dataset={dataset} />
        )}
      </div>
    </div>
  );
}
``;
