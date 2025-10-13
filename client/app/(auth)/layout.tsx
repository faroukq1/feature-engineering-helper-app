"use client";

import FeatureEngineeringTyping from "@/components/global/FeatureEngineeringTyping";
import { ToggleModeButton } from "@/components/global/ToggleModeButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Atom } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Atom className="size-4" />
            </Link>
            Feature Engineering Helper App
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative bg-muted hidden lg:flex flex-col">
        <div className="absolute top-5 right-5 z-50">
          <ToggleModeButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <FeatureEngineeringTyping />
        </div>
      </div>
    </div>
  );
}
