import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { AlertCircle, TrendingUp, Combine, Copy } from "lucide-react";
import {
  DatasetPreprocessingSchema,
  DatasetPreprocessingType,
} from "@/lib/schemas/DatasetPreprocessingSchema";
import axios from "axios";

export default function DataCleaningOperations() {
  const fillOptions = ["mean", "median", "mode", "zero"];

  const form = useForm<DatasetPreprocessingType>({
    resolver: zodResolver(DatasetPreprocessingSchema),
    defaultValues: {
      missingDataType: "none",
      fillMethod: "mean",
      missing_data: null,
      normalization: false,
      standarization: false,
      remove_deplicate: false,
    },
  });

  const onSubmit = async (values: DatasetPreprocessingType) => {
    const payload = {
      missing_data:
        values.missingDataType === "none"
          ? null
          : {
              remove_rows: values.missingDataType === "remove_rows",
              interpolate: values.missingDataType === "interpolate",
              fill_values:
                values.missingDataType === "fill"
                  ? {
                      mean: values.fillMethod === "mean",
                      median: values.fillMethod === "median",
                      mode: values.fillMethod === "mode",
                      zero: values.fillMethod === "zero",
                    }
                  : null,
            },
      normalization: values.normalization,
      standarization: values.standarization,
      remove_deplicate: values.remove_deplicate,
    };

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/process`;
      // const response = await axios.post(url, )
    } catch {
    } finally {
    }
  };

  const missingDataType = form.watch("missingDataType");

  return (
    <Form {...form}>
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
                  <FormField
                    control={form.control}
                    name="missingDataType"
                    render={({ field }) => (
                      <FormItem className="flex gap-2">
                        <FormLabel className="text-xs">Strategy</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="remove_rows">
                              Remove rows
                            </SelectItem>
                            <SelectItem value="interpolate">
                              Interpolate
                            </SelectItem>
                            <SelectItem value="fill">Fill values</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {missingDataType === "fill" && (
                    <FormField
                      control={form.control}
                      name="fillMethod"
                      render={({ field }) => (
                        <div className="space-y-3 pt-3 border-t">
                          <Label className="text-xs font-semibold">
                            Fill Method
                          </Label>
                          <div className="flex items-center gap-4">
                            {fillOptions.map((method) => (
                              <FormItem
                                key={method}
                                className="flex items-center mt-2"
                              >
                                <FormControl>
                                  <input
                                    type="radio"
                                    id={method}
                                    name="fillMethod"
                                    value={method}
                                    checked={field.value === method}
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                    className="mr-1"
                                  />
                                </FormControl>
                                <Label
                                  htmlFor={method}
                                  className="text-xs font-normal"
                                >
                                  {method}
                                </Label>
                              </FormItem>
                            ))}
                          </div>
                        </div>
                      )}
                    />
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
                  <FormField
                    control={form.control}
                    name="normalization"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            id="normalization"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label
                          htmlFor="normalization"
                          className="text-xs font-normal"
                        >
                          Enable normalization
                        </Label>
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Scales data to a fixed range (typically 0-1)
                  </p>
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
                  <FormField
                    control={form.control}
                    name="standarization"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            id="standardization"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label
                          htmlFor="standardization"
                          className="text-xs font-normal"
                        >
                          Enable standardization (Z-score)
                        </Label>
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Transforms data to have mean of 0 and standard deviation of
                    1
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
                  <FormField
                    control={form.control}
                    name="remove_deplicate"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            id="remove_duplicates"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label
                          htmlFor="remove_duplicates"
                          className="text-xs font-normal"
                        >
                          Remove duplicate rows
                        </Label>
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Removes rows that are completely identical
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
          Apply Operations
        </Button>
      </div>
    </Form>
  );
}
