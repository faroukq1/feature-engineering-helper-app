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
import { Code2, RotateCcw, Share2, MoreHorizontal, Save } from "lucide-react";

export default function OperationsPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("text-davinci-003");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [mode, setMode] = useState("complete");
  const [preset, setPreset] = useState("");

  const handleSubmit = () => {
    console.log("Submitting:", { prompt, model, temperature, maxLength, topP });
  };

  const handleReset = () => {
    setPrompt("");
    setTemperature([0.56]);
    setMaxLength([256]);
    setTopP([0.9]);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Operations</h1>
          <div className="flex items-center gap-2">
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Load a preset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chatbot">Chatbot</SelectItem>
                <SelectItem value="summarize">Summarize</SelectItem>
                <SelectItem value="translate">Translate</SelectItem>
                <SelectItem value="code">Code Generation</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Code2 className="mr-2 h-4 w-4" />
              View code
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Input */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex h-full flex-col space-y-4">
            {/* Mode Tabs */}
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="complete">
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    Complete
                  </span>
                </TabsTrigger>
                <TabsTrigger value="insert">
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Insert
                  </span>
                </TabsTrigger>
                <TabsTrigger value="edit">
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Textarea */}
            <Textarea
              placeholder="Write a tagline for an ice cream shop"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 resize-none"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button onClick={handleSubmit}>Submit</Button>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Settings */}
        <div className="w-[350px] max-h-[600px] border bg-muted/40 p-6 rounded mr-5 mt-5">
          <div className="space-y-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-davinci-003">
                    text-davinci-003
                  </SelectItem>
                  <SelectItem value="text-davinci-002">
                    text-davinci-002
                  </SelectItem>
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
      </div>
    </div>
  );
}
