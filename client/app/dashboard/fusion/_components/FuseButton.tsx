"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FuseButtonProps {
  canShow: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export default function FuseButton({ canShow, isLoading, onClick }: FuseButtonProps) {
  if (!canShow) return null;
  return (
    <Button onClick={onClick} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Fusing...
        </>
      ) : (
        <>Fuse Datasets</>
      )}
    </Button>
  );
}
