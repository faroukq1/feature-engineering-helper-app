"use client";

import { OperationHeader, DatasetViewer, DatasetOperations } from "./_components";

export default function OperationsPage() {
  return (
    <div className="flex flex-col w-full">
      <OperationHeader />

      <div className="flex flex-1 overflow-hidden">
        <DatasetViewer />
        <DatasetOperations />
      </div>
    </div>
  );
}
