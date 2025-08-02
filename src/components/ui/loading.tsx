"use client";

import { cn } from "~/lib/utils";
import { LoadingSpinnerProps } from "~/types/shortlink";

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function LoadingCard() {
  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
