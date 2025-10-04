"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ToggleModeButton } from "@/components/global/ToggleModeButton";
import { Atom, LogOut } from "lucide-react";
import Navbar from "@/components/global/Navbar";
import { Separator } from "@/components/ui/separator";

const DashboardPage = () => {
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
    <div className="relative">
      <div className="px-10 py-4 flex justify-between">
        <div className="flex-1 flex items-center gap-2">
          <Atom />
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

export default DashboardPage;
