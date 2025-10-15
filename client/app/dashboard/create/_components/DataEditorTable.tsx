"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { SchemaAttribute } from "./SchemaBuilder";

export interface DataRow {
  id: string;
  [key: string]: string | number | boolean | Date;
}

interface DataEditorTableProps {
  attributes: SchemaAttribute[];
  data: DataRow[];
  editingCell: { rowId: string; columnName: string } | null;
  setEditingCell: (cell: { rowId: string; columnName: string } | null) => void;
  renderEditableCell: (row: DataRow, attr: SchemaAttribute) => React.ReactNode;
  onDeleteRow: (rowId: string) => void;
  onAddRow: () => void;
}

export default function DataEditorTable({
  attributes,
  data,
  editingCell,
  setEditingCell,
  renderEditableCell,
  onDeleteRow,
  onAddRow,
}: DataEditorTableProps) {
  return (
    <div className="space-y-4">
      <div className="w-full max-h-[600px] overflow-auto rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              {attributes.map((attr) => (
                <TableHead key={attr.id} className="min-w-[120px] max-w-[250px]">
                  <div className="truncate" title={attr.name}>{attr.name}</div>
                </TableHead>
              ))}
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={attributes.length + 1} className="text-center text-zinc-500">
                  No rows yet. Click "Add Row" to start.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  {attributes.map((attr) => (
                    <TableCell key={attr.id} className="min-w-[120px] max-w-[250px]">
                      <div className="truncate">{renderEditableCell(row, attr)}</div>
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteRow(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button onClick={onAddRow} className="w-full">Add Row</Button>
    </div>
  );
}
