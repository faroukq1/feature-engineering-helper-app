"use client";

import { motion } from "framer-motion";
import { Dataset } from "@/types/DatasetsTypes";
import DatasetCard from "./DatasetCard";

interface DatasetGridProps {
  datasets: Dataset[];
  onCardClick: (dataset: Dataset, index: number) => void;
}

export default function DatasetGrid({ datasets, onCardClick }: DatasetGridProps) {
  return (
    <motion.div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {datasets.map((dataset, index) => (
        <motion.div
          key={dataset.file_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <DatasetCard dataset={dataset} onClick={() => onCardClick(dataset, index)} />
        </motion.div>
      ))}
    </motion.div>
  );
}
