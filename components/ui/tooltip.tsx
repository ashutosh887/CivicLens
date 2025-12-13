"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className={cn("relative group inline-block", className)}>
      {children}
      <div
        className={cn(
          "absolute z-50 px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-md shadow-lg whitespace-nowrap",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
          sideClasses[side],
          "before:content-[''] before:absolute",
          side === "top" && "before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-popover",
          side === "bottom" && "before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-popover",
          side === "left" && "before:left-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-l-popover",
          side === "right" && "before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-popover"
        )}
      >
        {content}
      </div>
    </div>
  );
}

