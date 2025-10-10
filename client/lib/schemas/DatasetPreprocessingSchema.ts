import z from "zod";

const fillValuesSchema = z.object({
  mean: z.boolean().optional(),
  median: z.boolean().optional(),
  mode: z.boolean().optional(),
  zero: z.boolean().optional(),
});

const missingDataSchema = z.object({
  remove_rows: z.boolean().optional(),
  interpolate: z.boolean().optional(),
  fill_values: fillValuesSchema.optional().nullable(),
});

export const DatasetPreprocessingSchema = z.object({
  missingDataType: z.enum(["none", "remove_rows", "interpolate", "fill"]),
  fillMethod: z.enum(["mean", "median", "mode", "zero"]).optional(),
  missing_data: missingDataSchema.optional().nullable(),
  normalization: z.boolean(),
  standarization: z.boolean(),
  remove_deplicate: z.boolean(),
});

export type DatasetPreprocessingType = z.infer<
  typeof DatasetPreprocessingSchema
>;
