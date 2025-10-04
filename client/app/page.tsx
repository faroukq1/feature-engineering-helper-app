import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="h-screen flex items-center justify-center gap-2">
      <Link className={buttonVariants()} href="/login">
        login
      </Link>
      <Link className={buttonVariants()} href="/dashboard">
        dashboard
      </Link>
    </div>
  );
};

export default page;
