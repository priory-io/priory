"use client";

import { Copy, Eye, Trash2, Calendar, Lock } from "lucide-react";
import Button from "~/components/ui/button";
import { ShortlinkCardProps } from "~/types/shortlink";

export function ShortlinkCard({
  shortlink,
  onCopy,
  onDelete,
}: ShortlinkCardProps) {
  return (
    <div className="border border-border/50 rounded-xl p-4 sm:p-6 hover:bg-card/80 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-primary font-medium text-sm sm:text-base">
              /{shortlink.shortCode}
            </span>
            {shortlink.password && (
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            {shortlink.expiresAt && (
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          {shortlink.title && (
            <h4 className="font-semibold text-foreground mb-2 text-base sm:text-lg leading-tight">
              {shortlink.title}
            </h4>
          )}

          <p className="text-sm text-muted-foreground truncate mb-2 pr-2">
            {shortlink.originalUrl}
          </p>

          {shortlink.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {shortlink.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{shortlink.clickCount}</span>
              <span>clicks</span>
            </span>
            <span className="text-xs sm:text-sm">
              Created {new Date(shortlink.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(shortlink.shortCode)}
            className="flex-1 sm:flex-none max-w-24 w-full"
          >
            <Copy className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(shortlink.id)}
            className="text-destructive hover:text-destructive/85 flex-1 sm:flex-none max-w-24 w-full"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
