"use client";

import { OperationHeader, DatasetViewer, DatasetOperations } from "./_components";

export default function OperationsPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <OperationHeader />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 overflow-auto">
          <DatasetViewer />
        </div>
        <div className="w-1/4 overflow-auto">
          <DatasetOperations />
        </div>
      </div>
    </div>
  );
}
