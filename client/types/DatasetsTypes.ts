export interface Dataset {
  file_id: string;
  dataset_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  download_url: string;
  data: Record<string, any>[];
}

export interface DatasetMetadata {
  rows: number;
  columns: number;
  columnNames: string[];
  columnTypes: Record<string, string>;
  summary: string;
}
