"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Download, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

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
        <Input
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
          className="h-8"
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
    <div className="w-full bg-black p-4 md:p-8">
      <div className="mx-auto">
        <header className="mb-8">
          <h1 className="text-balance text-4xl font-bold text-white">
            Dataset Creator
          </h1>
          <p className="mt-2 text-zinc-400">
            Define your schema, add data, and export to CSV or Excel
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Schema Builder */}
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-white">Schema Builder</CardTitle>
              <CardDescription className="text-zinc-400">
                Define attributes for your dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tempAttributes.map((attr, index) => (
                <div key={attr.id} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`name-${attr.id}`} className="sr-only">
                      Attribute Name
                    </Label>
                    <Input
                      id={`name-${attr.id}`}
                      placeholder="Attribute name"
                      value={attr.name}
                      onChange={(e) =>
                        updateTempAttribute(attr.id, "name", e.target.value)
                      }
                      className="border-zinc-800 bg-black text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`type-${attr.id}`} className="sr-only">
                      Type
                    </Label>
                    <Select
                      value={attr.type}
                      onValueChange={(value) =>
                        updateTempAttribute(attr.id, "type", value)
                      }
                    >
                      <SelectTrigger
                        id={`type-${attr.id}`}
                        className="border-zinc-800 bg-black text-white w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {tempAttributes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTempAttribute(attr.id)}
                      className="text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={addTempAttribute}
                  className="flex-1 border-zinc-800 bg-black text-white hover:bg-zinc-900"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Attribute
                </Button>
                <Button onClick={applySchema} className="flex-1">
                  Apply Schema
                </Button>
              </div>

              {attributes.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-black p-4">
                  <h3 className="mb-2 font-semibold text-white">
                    Current Schema:
                  </h3>
                  <ul className="flex gap-4 space-y-1 text-sm">
                    {attributes.map((attr) => (
                      <li key={attr.id} className="text-zinc-300">
                        <span className="font-medium">{attr.name}</span>
                        <span className="text-zinc-500"> ({attr.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Dynamic Table Editor */}
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-white">Data Editor</CardTitle>
              <CardDescription className="text-zinc-400">
                Add and edit rows in your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attributes.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-zinc-800">
                  <p className="text-zinc-500">No dataset schema defined yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-auto rounded-lg border border-zinc-800">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-zinc-900">
                          {attributes.map((attr) => (
                            <TableHead key={attr.id} className="text-zinc-400">
                              {attr.name}
                            </TableHead>
                          ))}
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length === 0 ? (
                          <TableRow className="border-zinc-800">
                            <TableCell
                              colSpan={attributes.length + 1}
                              className="text-center text-zinc-500"
                            >
                              No rows yet. Click "Add Row" to start.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data.map((row) => (
                            <TableRow
                              key={row.id}
                              className="border-zinc-800 hover:bg-zinc-900"
                            >
                              {attributes.map((attr) => (
                                <TableCell
                                  key={attr.id}
                                  className="text-zinc-300"
                                >
                                  {renderEditableCell(row, attr)}
                                </TableCell>
                              ))}
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteRow(row.id)}
                                  className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    onClick={addRow}
                    variant="outline"
                    className="w-full border-zinc-800 bg-black text-white hover:bg-zinc-900"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Row
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer - Export Options */}
        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-6 sm:flex-row">
          <div className="flex-1">
            <h3 className="font-semibold text-white">Export Dataset</h3>
            <p className="text-sm text-zinc-400">
              Download your dataset in CSV or Excel format
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToCSV}
              disabled={data.length === 0}
              variant="outline"
              className="border-zinc-800 bg-black text-white hover:bg-zinc-900 disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button onClick={exportToExcel} disabled={data.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
