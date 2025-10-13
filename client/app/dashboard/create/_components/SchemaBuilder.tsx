"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

export type AttributeType = "string" | "number" | "boolean" | "date";

export interface SchemaAttribute {
  id: string;
  name: string;
  type: AttributeType;
}

interface SchemaBuilderProps {
  tempAttributes: SchemaAttribute[];
  attributes: SchemaAttribute[];
  onAddTemp: () => void;
  onUpdateTemp: (id: string, field: "name" | "type", value: string) => void;
  onRemoveTemp: (id: string) => void;
  onApplySchema: () => void;
}

export default function SchemaBuilder({
  tempAttributes,
  attributes,
  onAddTemp,
  onUpdateTemp,
  onRemoveTemp,
  onApplySchema,
}: SchemaBuilderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schema Builder</CardTitle>
        <CardDescription>Define attributes for your dataset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tempAttributes.map((attr) => (
          <div key={attr.id} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor={`name-${attr.id}`} className="sr-only">
                Attribute Name
              </Label>
              <Input
                id={`name-${attr.id}`}
                placeholder="Attribute name"
                value={attr.name}
                onChange={(e) => onUpdateTemp(attr.id, "name", e.target.value)}
                className="border border-neutral-400"
              />
            </div>
            <div className="w-32">
              <Label htmlFor={`type-${attr.id}`} className="sr-only">
                Type
              </Label>
              <Select
                value={attr.type}
                onValueChange={(value) => onUpdateTemp(attr.id, "type", value)}
              >
                <SelectTrigger id={`type-${attr.id}`} className="border border-neutral-400 w-full">
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
              <Button variant="outline" size="icon" onClick={() => onRemoveTemp(attr.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddTemp} className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
          <Button onClick={onApplySchema} className="flex-1">
            Apply Schema
          </Button>
        </div>

        {attributes.length > 0 && (
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Current Schema:</h3>
            <ul className="flex gap-4 space-y-1 text-sm">
              {attributes.map((attr) => (
                <li key={attr.id}>
                  <span className="font-medium">{attr.name}</span>
                  <span className="text-neutral-600"> ({attr.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
