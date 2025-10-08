"use client";
import { Button } from "@/components/ui/button";
import { useCounterStore } from "@/store/UseCounterStore";
import React from "react";

const page = () => {
  const { count, increase, decrease } = useCounterStore();
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-2">
      <Button disabled>{count}</Button>
      <Button variant="outline" onClick={() => increase()}>
        inc
      </Button>
      <Button variant="outline" onClick={() => decrease()}>
        dec
      </Button>
    </div>
  );
};

export default page;
