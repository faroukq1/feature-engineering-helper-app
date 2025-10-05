"use client";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, TrendingUp, Combine, Copy } from "lucide-react";

const DataCleaningOperations = () => {
  // Missing Data
  const [missingDataStrategy, setMissingDataStrategy] = useState("remove");
  const [fillMethod, setFillMethod] = useState("mean");

  // Normalization
  const [enableNormalization, setEnableNormalization] = useState(false);
  const [normalizationMethod, setNormalizationMethod] = useState("min-max");

  // Standardization
  const [enableStandardization, setEnableStandardization] = useState(false);

  // Duplicates
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [duplicateStrategy, setDuplicateStrategy] = useState("first");

  const handleApplyOperations = () => {
    console.log("Applying operations:", {
      missingData: { strategy: missingDataStrategy, fillMethod },
      normalization: {
        enabled: enableNormalization,
        method: normalizationMethod,
      },
      standardization: { enabled: enableStandardization },
      duplicates: { remove: removeDuplicates, strategy: duplicateStrategy },
    });
  };

  return (
    <div className="flex flex-col justify-between w-[380px] max-h-[600px] overflow-y-auto border p-6 rounded-lg shadow-sm mt-5 mr-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Data Cleaning</h3>
          <p className="text-sm text-muted-foreground">
            Configure cleaning operations for your dataset
          </p>
        </div>

        <Separator />

        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="missing"
        >
          {/* Missing Data */}
          <AccordionItem value="missing">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Missing Data
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between space-y-2">
                  <Label className="text-xs">Strategy</Label>
                  <Select
                    value={missingDataStrategy}
                    onValueChange={setMissingDataStrategy}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remove">Remove rows</SelectItem>
                      <SelectItem value="fill">Fill values</SelectItem>
                      <SelectItem value="interpolate">Interpolate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {missingDataStrategy === "fill" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Fill Method</Label>
                    <RadioGroup
                      value={fillMethod}
                      onValueChange={setFillMethod}
                      className="flex mt-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mean" id="mean" />
                        <Label htmlFor="mean" className="text-xs font-normal">
                          Mean
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="median" id="median" />
                        <Label htmlFor="median" className="text-xs font-normal">
                          Median
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mode" id="mode" />
                        <Label htmlFor="mode" className="text-xs font-normal">
                          Mode
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="zero" id="zero" />
                        <Label htmlFor="zero" className="text-xs font-normal">
                          Zero
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Normalization */}
          <AccordionItem value="normalize">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Normalization
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="normalize"
                    checked={enableNormalization}
                    // onCheckedChange={setEnableNormalization}
                  />
                  <Label htmlFor="normalize" className="text-xs font-normal">
                    Enable normalization
                  </Label>
                </div>

                {enableNormalization && (
                  <div className="space-y-2">
                    <Label className="text-xs">Method</Label>
                    <Select
                      value={normalizationMethod}
                      onValueChange={setNormalizationMethod}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="min-max">Min-Max (0-1)</SelectItem>
                        <SelectItem value="max-abs">Max Absolute</SelectItem>
                        <SelectItem value="robust">Robust Scaler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Standardization */}
          <AccordionItem value="standardize">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Combine className="h-4 w-4" />
                Standardization
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="standardize"
                    checked={enableStandardization}
                    // onCheckedChange={setEnableStandardization}
                  />
                  <Label htmlFor="standardize" className="text-xs font-normal">
                    Enable standardization (Z-score)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Transforms data to have mean of 0 and standard deviation of 1
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Remove Duplicates */}
          <AccordionItem value="duplicates">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Remove Duplicates
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="duplicates"
                    checked={removeDuplicates}
                    // onCheckedChange={setRemoveDuplicates}
                  />
                  <Label htmlFor="duplicates" className="text-xs font-normal">
                    Remove duplicate rows
                  </Label>
                </div>

                {removeDuplicates && (
                  <div className="space-y-2">
                    <Label className="text-xs">Keep</Label>
                    <RadioGroup
                      value={duplicateStrategy}
                      onValueChange={setDuplicateStrategy}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="first" id="first" />
                        <Label htmlFor="first" className="text-xs font-normal">
                          First occurrence
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="last" id="last" />
                        <Label htmlFor="last" className="text-xs font-normal">
                          Last occurrence
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="text-xs font-normal">
                          Remove all duplicates
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />
      </div>
      <Button onClick={handleApplyOperations} className="w-full">
        Apply Operations
      </Button>
    </div>
  );
};

export default DataCleaningOperations;
