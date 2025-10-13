import { Dataset, DatasetMetadata } from "@/types/DatasetsTypes";

export const typeColors = {
  CSV: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Excel: "bg-green-500/10 text-green-500 border-green-500/20",
  JSON: "bg-purple-500/10 text-purple-500 border-purple-500/20",
} as const;

export type FileType = keyof typeof typeColors;

export const getFileType = (filename: string): FileType => {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "csv") return "CSV";
  if (ext === "xlsx" || ext === "xls") return "Excel";
  return "JSON";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const extractMetadata = (dataset: Dataset): DatasetMetadata => {
  const rows = dataset.data.length;
  const columns = rows > 0 ? Object.keys(dataset.data[0]).length : 0;
  const columnNames = rows > 0 ? Object.keys(dataset.data[0]) : [];

  const columnTypes: Record<string, string> = {};
  if (rows > 0) {
    columnNames.forEach((col) => {
      const value = (dataset.data[0] as any)[col];
      if (value === null || value === undefined) {
        columnTypes[col] = "unknown";
      } else if (typeof value === "number") {
        columnTypes[col] = "number";
      } else if (typeof value === "boolean") {
        columnTypes[col] = "boolean";
      } else if (!isNaN(Date.parse(value))) {
        columnTypes[col] = "date";
      } else {
        columnTypes[col] = "string";
      }
    });
  }

  const summary = `Dataset with ${rows} rows and ${columns} columns`;

  return { rows, columns, columnNames, columnTypes, summary };
};
