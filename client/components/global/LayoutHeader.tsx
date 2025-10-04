"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Atom, LogOut } from "lucide-react";
import Navbar from "./Navbar";
import { ToggleModeButton } from "./ToggleModeButton";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";

const LayoutHeader = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const logOut = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  return (
    <div>
      <div className="px-10 py-4 flex justify-between">
        <div className="flex-1 flex items-center gap-2">
          <Button variant="default" size="icon">
            <Atom className="size-6" />
          </Button>
          <div className="flex-1">
            <Navbar />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ToggleModeButton />
          <Button
            variant="destructive"
            size="icon"
            className="cursor-pointer"
            onClick={logOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
      <Separator className="my-2" />
    </div>
  );
};

export default LayoutHeader;
