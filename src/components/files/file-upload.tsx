"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, AlertCircle, QrCode } from "lucide-react";
import Button from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { QRUploadModal } from "./qr-upload-modal";
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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
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
              } catch {
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "uploading":
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      case "pending":
        return (
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground opacity-50" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <motion.div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
            : "border-border",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging
            ? "hsl(var(--primary))"
            : "hsl(var(--border))",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          className={cn(
            "transition-all duration-200",
            isDragging && "scale-110",
          )}
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Upload
              className={cn(
                "mx-auto h-12 w-12 mb-4 transition-colors duration-200",
                isDragging ? "text-primary" : "text-muted-foreground",
              )}
            />
          </motion.div>
        </motion.div>
        <div className="space-y-3">
          <motion.p
            className={cn(
              "text-lg font-semibold transition-colors duration-200",
              isDragging ? "text-primary" : "text-foreground",
            )}
            animate={{ scale: isDragging ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isDragging ? "Drop your files here" : "Drag & drop files here"}
          </motion.p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <label
              className={cn(
                "font-medium cursor-pointer transition-colors duration-200",
                "text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm",
              )}
            >
              browse from your device
              <input
                type="file"
                className="sr-only"
                multiple={multiple}
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,application/*,.zip,.rar,.7z,.tar,.gz"
              />
            </label>
          </p>
        </div>
      </motion.div>

      <motion.div
        className="flex gap-2 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsQRModalOpen(true)}
            className="text-xs flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <QrCode className="w-4 h-4" />
            </motion.div>
            Upload via Phone
          </Button>
        </motion.div>
      </motion.div>

      {uploads.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
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
            <AnimatePresence>
              {uploads.map((upload, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
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
                          <span className="text-destructive">
                            {upload.error}
                          </span>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <QRUploadModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
