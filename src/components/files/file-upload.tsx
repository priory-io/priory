"use client";

import { useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import Button from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  FileUploadProgress,
  isAllowedMimeType,
  MAX_FILE_SIZE,
  getFileCategory,
} from "~/types/file";

interface FileUploadProps {
  onUploadComplete?: (files: any[]) => void;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  multiple = true,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [multiple],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      e.target.value = "";
    },
    [multiple],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const validFiles: File[] = [];
      const newUploads: FileUploadProgress[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          newUploads.push({
            file,
            progress: 0,
            status: "error",
            error: "File too large",
          });
          continue;
        }

        if (!isAllowedMimeType(file.type)) {
          newUploads.push({
            file,
            progress: 0,
            status: "error",
            error: "File type not allowed",
          });
          continue;
        }

        validFiles.push(file);
        newUploads.push({
          file,
          progress: 0,
          status: "pending",
        });

        if (!multiple) break;
      }

      setUploads((prev) => [...prev, ...newUploads]);
      uploadFiles(validFiles);
    },
    [multiple],
  );

  const uploadFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      try {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.file === file
              ? { ...upload, status: "uploading", progress: 0 }
              : upload,
          ),
        );

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        return new Promise<any>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploads((prev) =>
                prev.map((upload) =>
                  upload.file === file ? { ...upload, progress } : upload,
                ),
              );
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                setUploads((prev) =>
                  prev.map((upload) =>
                    upload.file === file
                      ? { ...upload, status: "completed", progress: 100 }
                      : upload,
                  ),
                );
                resolve(result);
              } catch (error) {
                reject(new Error("Invalid response"));
              }
            } else {
              reject(new Error("Upload failed"));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("POST", "/api/files");
          xhr.send(formData);
        });
      } catch (error) {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.file === file
              ? {
                  ...upload,
                  status: "error",
                  error: "Upload failed",
                }
              : upload,
          ),
        );
        throw error;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<any>).value);

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
        window.dispatchEvent(new CustomEvent("fileUploaded"));
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setUploads((prev) =>
      prev.filter((upload) => upload.status !== "completed"),
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: FileUploadProgress["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          "hover:border-border/80",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            Drop files here, or{" "}
            <label className="text-primary hover:text-primary/80 cursor-pointer">
              browse
              <input
                type="file"
                className="sr-only"
                multiple={multiple}
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,application/*,.zip,.rar,.7z,.tar,.gz"
              />
            </label>
          </p>
          <p className="text-sm text-muted-foreground">
            Support for images, videos, audio, documents, and archives up to{" "}
            {formatFileSize(MAX_FILE_SIZE)}
          </p>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Uploads ({uploads.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              className="text-xs"
            >
              Clear completed
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploads.map((upload, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(upload.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {upload.file.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUpload(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(upload.file.size)}</span>
                    <span>•</span>
                    <span className="capitalize">
                      {getFileCategory(upload.file.type)}
                    </span>
                    {upload.error && (
                      <>
                        <span>•</span>
                        <span className="text-destructive">{upload.error}</span>
                      </>
                    )}
                  </div>

                  {upload.status === "uploading" && (
                    <div className="w-full bg-border rounded-full h-1 mt-2">
                      <div
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
