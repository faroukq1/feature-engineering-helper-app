import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*]/.test(password)) score += 1; // Special character
  return score;
};

export const parseCSV = (text: string) => {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";
      // Try to convert to number if possible
      row[header] = isNaN(Number(value)) ? value : Number(value);
    });

    // Only add row if it has at least one non-empty value
    if (
      Object.values(row).some((v) => v !== "" && v !== null && v !== undefined)
    ) {
      rows.push(row);
    }
  }

  return rows;
};
