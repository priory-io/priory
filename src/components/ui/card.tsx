"use client";

import { CardProps } from "~/types/components";
import { cn } from "~/lib/utils";

export default function Card({
  children,
  className,
  hover = false,
  padding = "md",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = cn(
    "bg-card/50 backdrop-blur-sm border border-border rounded-2xl transition-all duration-300",
    paddingClasses[padding],
    hover && "hover:border-primary/50 hover:shadow-lg hover:-translate-y-1",
    className,
  );

  return <div className={baseClasses}>{children}</div>;
}
