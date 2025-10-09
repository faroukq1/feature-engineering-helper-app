import React, { useState } from "react";
import { Home, Wrench, Database, FileSpreadsheet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { icon: Home, label: "Dashboard", active: true, href: "/dashboard" },
  {
    icon: FileSpreadsheet,
    label: "Create dataset",
    active: false,
    href: "/dashboard/create",
  },
  {
    icon: Wrench,
    label: "Operations",
    active: false,
    href: "/dashboard/operations",
  },
  { icon: Database, label: "Fusion", active: false, href: "/dashboard/fusion" },
];
export default function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-center">
      <nav className="bg-background border border-border rounded-md px-2 py-2 flex items-center gap-1">
        {navItems.map((item, index) => (
          <Link
            href={item.href}
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "icon",
              }),
              "flex items-center justify-center gap-3 rounded-md transition-all duration-600 h-12",
              hoveredIndex === index && "px-4 w-auto",
              hoveredIndex !== index && "w-11 px-0",
              item.active
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5",
                item.active ? "text-foreground" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap transition-all duration-600",
                item.active ? "text-foreground" : "text-muted-foreground",
                hoveredIndex === index
                  ? "opacity-100 max-w-xs"
                  : "opacity-0 max-w-0 overflow-hidden hidden"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
