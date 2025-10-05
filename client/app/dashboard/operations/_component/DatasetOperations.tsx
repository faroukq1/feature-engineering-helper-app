"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const DatasetOperations = () => {
  const [model, setModel] = useState("text-davinci-003");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);

  return (
    <div className="w-[350px] max-h-[600px] border bg-muted/40 p-6 rounded mr-5 mt-5">
      <div className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-davinci-003">text-davinci-003</SelectItem>
              <SelectItem value="text-davinci-002">text-davinci-002</SelectItem>
              <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
              <SelectItem value="gpt-4">gpt-4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Temperature</label>
            <span className="text-sm text-muted-foreground">
              {temperature[0].toFixed(2)}
            </span>
          </div>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Maximum Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Maximum Length</label>
            <span className="text-sm text-muted-foreground">
              {maxLength[0]}
            </span>
          </div>
          <Slider
            value={maxLength}
            onValueChange={setMaxLength}
            max={4000}
            step={1}
            className="w-full"
          />
        </div>

        {/* Top P Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Top P</label>
            <span className="text-sm text-muted-foreground">
              {topP[0].toFixed(1)}
            </span>
          </div>
          <Slider
            value={topP}
            onValueChange={setTopP}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DatasetOperations;
