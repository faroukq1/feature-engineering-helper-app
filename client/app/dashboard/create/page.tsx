"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { SchemaBuilder, DataEditorTable, ExportActions } from "./_components";

type AttributeType = "string" | "number" | "boolean" | "date";

interface SchemaAttribute {
  id: string;
  name: string;
  type: AttributeType;
}

interface DataRow {
  id: string;
  [key: string]: string | number | boolean | Date;
}

export default function DatasetCreator() {
  const [attributes, setAttributes] = useState<SchemaAttribute[]>([]);
  const [tempAttributes, setTempAttributes] = useState<SchemaAttribute[]>([
    { id: crypto.randomUUID(), name: "", type: "string" },
  ]);
  const [data, setData] = useState<DataRow[]>([]);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnName: string;
  } | null>(null);

  const addTempAttribute = () => {
    setTempAttributes([
      ...tempAttributes,
      { id: crypto.randomUUID(), name: "", type: "string" },
    ]);
  };

  const updateTempAttribute = (
    id: string,
    field: "name" | "type",
    value: string
  ) => {
    setTempAttributes(
      tempAttributes.map((attr) =>
        attr.id === id ? { ...attr, [field]: value } : attr
      )
    );
  };

  const removeTempAttribute = (id: string) => {
    setTempAttributes(tempAttributes.filter((attr) => attr.id !== id));
  };

  const applySchema = () => {
    const validAttributes = tempAttributes.filter((attr) => attr.name.trim());
    if (validAttributes.length === 0) {
      alert("Please add at least one attribute with a name");
      return;
    }
    setAttributes(validAttributes);
    setData([]);
  };

  const addRow = () => {
    const newRow: DataRow = { id: crypto.randomUUID() };
    attributes.forEach((attr) => {
      switch (attr.type) {
        case "string":
          newRow[attr.name] = "";
          break;
        case "number":
          newRow[attr.name] = 0;
          break;
        case "boolean":
          newRow[attr.name] = false;
          break;
        case "date":
          newRow[attr.name] = new Date().toISOString().split("T")[0];
          break;
      }
    });
    setData([...data, newRow]);
  };

  const updateCell = (rowId: string, columnName: string, value: any) => {
    setData(
      data.map((row) =>
        row.id === rowId ? { ...row, [columnName]: value } : row
      )
    );
  };

  const deleteRow = (rowId: string) => {
    setData(data.filter((row) => row.id !== rowId));
  };

  const renderEditableCell = (row: DataRow, attr: SchemaAttribute) => {
    const isEditing =
      editingCell?.rowId === row.id && editingCell?.columnName === attr.name;
    const value = row[attr.name];

    if (attr.type === "boolean") {
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={value as boolean}
            onCheckedChange={(checked) =>
              updateCell(row.id, attr.name, checked)
            }
          />
        </div>
      );
    }

    if (isEditing) {
      return (
        <input
          type={attr.type === "date" ? "date" : attr.type}
          value={value as string}
          onChange={(e) => {
            const newValue =
              attr.type === "number"
                ? Number.parseFloat(e.target.value) || 0
                : e.target.value;
            updateCell(row.id, attr.name, newValue);
          }}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditingCell(null);
          }}
          autoFocus
          className="h-8 w-fit"
        />
      );
    }

    return (
      <div
        className="cursor-pointer rounded px-2 py-1 hover:bg-muted"
        onClick={() => setEditingCell({ rowId: row.id, columnName: attr.name })}
      >
        {attr.type === "date"
          ? new Date(value as string).toLocaleDateString()
          : String(value)}
      </div>
    );
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = attributes.map((attr) => attr.name).join(",");
    const rows = data.map((row) =>
      attributes
        .map((attr) => {
          const value = row[attr.name];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => {
        const cleanRow: any = {};
        attributes.forEach((attr) => {
          cleanRow[attr.name] = row[attr.name];
        });
        return cleanRow;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dataset");
    XLSX.writeFile(workbook, "dataset.xlsx");
  };

  return (
    <div className="w-full p-4 md:p-8">
      <div className="mx-auto">
        <header className="mb-8">
          <h1 className="text-balance text-4xl font-bold">Dataset Creator</h1>
          <p className="mt-2">
            Define your schema, add data, and export to CSV or Excel
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <SchemaBuilder
            tempAttributes={tempAttributes}
            attributes={attributes}
            onAddTemp={addTempAttribute}
            onUpdateTemp={updateTempAttribute}
            onRemoveTemp={removeTempAttribute}
            onApplySchema={applySchema}
          />

          {attributes.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p>No dataset schema defined yet</p>
            </div>
          ) : (
            <DataEditorTable
              attributes={attributes}
              data={data}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              renderEditableCell={renderEditableCell}
              onDeleteRow={deleteRow}
              onAddRow={addRow}
            />
          )}
        </div>

        <ExportActions onExportCSV={exportToCSV} onExportExcel={exportToExcel} disabled={data.length === 0} />
      </div>
    </div>
  );
}
