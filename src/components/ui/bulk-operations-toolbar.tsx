"use client";

import { Download, Trash2, X, CheckSquare } from "lucide-react";
import Button from "./button";

interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkDownload?: () => void;
  type: "files" | "shortlinks";
}

export function BulkOperationsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkDownload,
  type,
}: BulkOperationsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const allSelected = selectedCount === totalCount;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} {type} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="text-primary hover:text-primary"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {type === "files" && onBulkDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Selected
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
