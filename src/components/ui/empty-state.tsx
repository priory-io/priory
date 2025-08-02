"use client";

import { Plus } from "lucide-react";
import Button from "~/components/ui/button";
import { EmptyStateProps } from "~/types/shortlink";

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

        <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
          {description}
        </p>

        {actionText && onAction && (
          <Button onClick={onAction} className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
