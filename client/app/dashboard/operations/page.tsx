"use client";

import OperationHeader from "./_component/OperationHeader";
import DatasetViewer from "./_component/DatasetViewer";
import DatasetOperations from "./_component/DatasetOperations";

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
