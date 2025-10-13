"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface StatusMessagesProps {
  error: string | null;
  diagnostics: string[];
  columnsMatch: boolean;
  selectedCount: number;
}

export default function StatusMessages({ error, diagnostics, columnsMatch, selectedCount }: StatusMessagesProps) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="flex flex-col gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
          {diagnostics.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-destructive">
              {diagnostics.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedCount >= 2 && columnsMatch && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-600">All selected datasets have matching columns and can be fused</p>
        </div>
      )}

      {selectedCount >= 2 && !columnsMatch && (
        <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-600">Column mismatch detected. All datasets must have identical columns.</p>
        </div>
      )}
    </div>
  );
}
