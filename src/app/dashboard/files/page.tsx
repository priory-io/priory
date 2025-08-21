"use client";

import { useMemo, useCallback, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { authClient } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import Button from "~/components/ui/button";
import { Plus, Search, Filter, X, CheckSquare } from "lucide-react";
import { FileUpload } from "~/components/files/file-upload";
import { FileCard } from "~/components/files/file-card";
import { BulkOperationsToolbar } from "~/components/ui/bulk-operations-toolbar";
import { EmptyState } from "~/components/ui/empty-state";
import { LoadingPage, LoadingSpinner } from "~/components/ui/loading";
import { useToast } from "~/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FileData, getFileCategory } from "~/types/file";

const fetcher = (url: string, signal?: AbortSignal) =>
  fetch(url, signal ? { signal } : {}).then(async (r) => {
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      const msg = data?.error || `Request failed: ${r.status}`;
      throw new Error(msg);
    }
    return r.json();
  });

export default function FilesPage() {
  const { data: session, isPending } = authClient.useSession();
  const { addToast } = useToast();
  const uploadDialogRef = useRef<HTMLButtonElement | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const aborter = useRef<AbortController | null>(null);
  const swrKey = session?.user ? `/api/files?page=${page}&limit=20` : null;

  const { data, error, isLoading } = useSWR<{
    files: FileData[];
    hasMore: boolean;
    page: number;
    limit: number;
  }>(
    swrKey,
    async (key: string) => {
      aborter.current?.abort();
      aborter.current = new AbortController();
      return fetcher(key, aborter.current.signal);
    },
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  );

  const files = useMemo(() => data?.files ?? [], [data]);

  const filteredFiles = useMemo(() => {
    let filtered = files;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.filename.toLowerCase().includes(query) ||
          file.originalFilename.toLowerCase().includes(query),
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (file) => getFileCategory(file.mimeType) === selectedFilter,
      );
    }

    return filtered;
  }, [files, searchQuery, selectedFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
  };

  const hasActiveFilters = searchQuery.trim() || selectedFilter !== "all";

  const closeUploadDialog = useCallback(() => {
    uploadDialogRef.current?.click();
  }, []);

  const handleUploadComplete = useCallback(
    (uploadedFiles: any[]) => {
      addToast({
        type: "success",
        title: "Files uploaded",
        description: `Successfully uploaded ${uploadedFiles.length} file(s).`,
      });
      mutate(swrKey);
      closeUploadDialog();
    },
    [addToast, closeUploadDialog, swrKey],
  );

  const handleFileSelection = useCallback(
    (fileId: string, selected: boolean) => {
      setSelectedFiles((prev) => {
        const newSelection = new Set(prev);
        if (selected) {
          newSelection.add(fileId);
        } else {
          newSelection.delete(fileId);
        }
        return newSelection;
      });
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedFiles(new Set(filteredFiles.map((file) => file.id)));
  }, [filteredFiles]);

  const handleClearSelection = useCallback(() => {
    setSelectedFiles(new Set());
    setSelectionMode(false);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const fileIds = Array.from(selectedFiles);
    if (fileIds.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${fileIds.length} file${fileIds.length > 1 ? "s" : ""}?`;
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch("/api/files/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete files");
      }

      const result = await res.json();

      addToast({
        type: "success",
        title: "Files deleted",
        description: `Successfully deleted ${result.deletedCount} file${result.deletedCount > 1 ? "s" : ""}.`,
      });

      setSelectedFiles(new Set());
      setSelectionMode(false);
      await mutate(swrKey);
    } catch (error) {
      console.error(`Failed to delete files: ${error}`);
      addToast({
        type: "error",
        title: "Failed to delete files",
        description: "Please try again.",
      });
    }
  }, [selectedFiles, addToast, swrKey]);

  const handleBulkDownload = useCallback(async () => {
    const fileIds = Array.from(selectedFiles);
    if (fileIds.length === 0) return;

    try {
      const res = await fetch("/api/files/bulk/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to prepare download");
      }

      const result = await res.json();

      if (result.files.length === 1) {
        const file = result.files[0];
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.filename;
        link.click();
      } else {
        result.files.forEach((file: any) => {
          const link = document.createElement("a");
          link.href = file.url;
          link.download = file.filename;
          link.click();
        });
      }

      addToast({
        type: "success",
        title: "Download started",
        description: `Starting download of ${result.files.length} file${result.files.length > 1 ? "s" : ""}.`,
      });
    } catch (error) {
      console.error(`Download failed: ${error}`);
      addToast({
        type: "error",
        title: "Download failed",
        description: "Please try again.",
      });
    }
  }, [selectedFiles, addToast]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedFiles(new Set());
    }
  }, [selectionMode]);

  const deleteFile = useCallback(
    async (id: string) => {
      if (!swrKey) return;

      const prev = data;

      mutate(
        swrKey,
        (current: typeof data | undefined) => {
          if (!current) return current;
          return {
            ...current,
            files: current.files.filter((f) => f.id !== id),
          };
        },
        false,
      );

      try {
        const res = await fetch(`/api/files/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Delete failed");
        }

        addToast({
          type: "success",
          title: "File deleted",
          description: "The file has been removed.",
        });

        window.dispatchEvent(new CustomEvent("fileUploaded"));

        await mutate(swrKey);
      } catch {
        mutate(swrKey, prev, false);
        addToast({
          type: "error",
          title: "Failed to delete",
          description: "Please try again.",
        });
      }
    },
    [addToast, data, swrKey],
  );

  const copyToClipboard = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        addToast({
          type: "success",
          title: "Copied",
          description: "File URL copied to clipboard.",
        });
      } catch {
        addToast({
          type: "error",
          title: "Copy failed",
          description: "Please copy it manually.",
        });
      }
    },
    [addToast],
  );

  const renameFile = useCallback(
    async (id: string, newFilename: string) => {
      try {
        const res = await fetch(`/api/files/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: newFilename }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to rename file");
        }

        addToast({
          type: "success",
          title: "File renamed",
          description: "The file has been renamed successfully.",
        });

        await mutate(swrKey);
      } catch (e) {
        addToast({
          type: "error",
          title: "Failed to rename file",
          description:
            e instanceof Error ? e.message : "Please try again shortly.",
        });
      }
    },
    [addToast, swrKey],
  );

  if (isPending) return <LoadingPage />;
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Files
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Upload, manage, and organize your files in the cloud.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto"
              ref={uploadDialogRef}
              aria-label="Upload files"
            >
              <Plus className="w-4 h-4" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleSelectionMode}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            {selectionMode ? "Cancel Selection" : "Select Files"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {selectedFilter === "all"
                  ? "All Files"
                  : selectedFilter.charAt(0).toUpperCase() +
                    selectedFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                All Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("image")}>
                Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("video")}>
                Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("audio")}>
                Audio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedFilter("application")}
              >
                Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("archive")}>
                Archives
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {selectionMode && (
        <BulkOperationsToolbar
          selectedCount={selectedFiles.size}
          totalCount={filteredFiles.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkDownload={handleBulkDownload}
          type="files"
        />
      )}

      <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Your Files
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load"
            description="We couldn't load your files. Try again."
            actionText="Retry"
            onAction={() => mutate(swrKey)}
          />
        ) : filteredFiles.length === 0 && hasActiveFilters ? (
          <EmptyState
            title="No files found"
            description="No files match your current search or filter criteria."
            actionText="Clear Filters"
            onAction={clearFilters}
          />
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            title="No files yet"
            description="Upload your first file to get started."
            actionText="Upload Files"
            onAction={() => uploadDialogRef.current?.click()}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onCopy={copyToClipboard}
                  onDelete={deleteFile}
                  onRename={renameFile}
                  isSelected={selectedFiles.has(file.id)}
                  onSelectionChange={handleFileSelection}
                  selectionMode={selectionMode}
                />
              ))}
            </div>

            {data?.hasMore && !hasActiveFilters && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading}
                >
                  Load More Files
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
