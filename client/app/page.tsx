"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Grid3x3, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DatasetLanding() {
  const router = useRouter();
  const user = localStorage.getItem("user");
  const handleGoToDashboard = () => {
    if (user) router.push("/dashboard");
    else router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Main container */}
      <div className="w-full bg-background overflow-hidden">
        {/* Hero section */}
        <div className="md:p-16 p-8 relative overflow-hidden min-h-screen flex items-center justify-center">
          {/* Decorative curved lines */}
          <svg
            className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-64 opacity-30"
            viewBox="0 0 100 200"
          >
            <path
              d="M 10 20 Q 50 80 10 140"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-muted-foreground"
            />
            <circle
              cx="10"
              cy="20"
              r="4"
              fill="currentColor"
              className="text-muted-foreground"
            />
            <circle
              cx="10"
              cy="140"
              r="4"
              fill="currentColor"
              className="text-muted-foreground"
            />
          </svg>

          <svg
            className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-64 opacity-30"
            viewBox="0 0 100 200"
          >
            <path
              d="M 90 20 Q 50 80 90 140"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-muted-foreground"
            />
            <circle
              cx="90"
              cy="20"
              r="4"
              fill="currentColor"
              className="text-muted-foreground"
            />
            <circle
              cx="90"
              cy="140"
              r="4"
              fill="currentColor"
              className="text-muted-foreground"
            />
          </svg>

          <div className="flex flex-col items-center text-center relative z-10 max-w-4xl">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-5xl md:text-7xl font-bold text-balance leading-tight text-foreground"
            >
              Preprocess Your Datasets Effortlessly
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 max-w-2xl text-muted-foreground text-balance text-lg"
            >
              Accelerate your machine learning workflow with automated feature
              engineering, data cleaning, and preprocessing tools. Prepare your
              datasets for modeling in just a few clicks.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size="lg"
                className="rounded-full shadow-xl"
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
                <motion.div transition={{ duration: 0.2 }}>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Features section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full"
            >
              <Card className="p-6 backdrop-blur-sm bg-card/50 border border-muted hover:border-foreground/20 transition-colors">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-lime-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Automated Feature Engineering
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automatically create, select, and transform features to boost
                  your model performance.
                </p>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border border-muted hover:border-foreground/20 transition-colors">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-lime-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Data Preprocessing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clean, normalize, and encode your datasets with intuitive
                  tools for every ML workflow.
                </p>
              </Card>

              <Card className="p-6 backdrop-blur-sm bg-card/50 border border-muted hover:border-foreground/20 transition-colors">
                <div className="flex items-center justify-center mb-4">
                  <Grid3x3 className="h-8 w-8 text-lime-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Visualization & Export
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore your processed data visually and export ready-to-use
                  datasets for modeling.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
