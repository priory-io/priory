"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  QrCode,
  RotateCcw,
} from "lucide-react";
import Button from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { QRUploadModal } from "./qr-upload-modal";
import {
  FileUploadProgress,
  isAllowedMimeType,
  MAX_FILE_SIZE,
  getFileCategory,
} from "~/types/file";

const UPLOAD_CONFIG = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  timeoutMs: 60 * 60 * 1000,
  concurrentUploads: 3,
};

interface FileUploadProps {
  onUploadComplete?: (files: any[]) => void;
  multiple?: boolean;
  className?: string;
}

interface ExtendedFileUploadProgress extends FileUploadProgress {
  retryCount?: number;
}

function getRetryDelay(retryCount: number): number {
  const exponentialDelay = Math.min(
    UPLOAD_CONFIG.baseDelayMs * Math.pow(2, retryCount),
    UPLOAD_CONFIG.maxDelayMs,
  );
  const jitter = exponentialDelay * Math.random() * 0.25;
  return exponentialDelay + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function FileUpload({
  onUploadComplete,
  multiple = true,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<ExtendedFileUploadProgress[]>([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadsRef = useRef<number>(0);
  const uploadQueueRef = useRef<File[]>([]);
  const successfulUploadsRef = useRef<any[]>([]);
  const abortControllersRef = useRef<Map<File, AbortController>>(new Map());

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

  const uploadSingleFile = useCallback(
    async (file: File, retryCount = 0): Promise<any> => {
      const abortController = new AbortController();
      abortControllersRef.current.set(file, abortController);

      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        let timeoutId: ReturnType<typeof setTimeout>;

        timeoutId = setTimeout(() => {
          xhr.abort();
          reject(new Error("Upload timeout"));
        }, UPLOAD_CONFIG.timeoutMs);

        abortController.signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          xhr.abort();
          reject(new Error("Upload cancelled"));
        });

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
          clearTimeout(timeoutId);
          abortControllersRef.current.delete(file);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch {
              reject(new Error("Invalid response"));
            }
          } else if (xhr.status === 429) {
            const retryAfter = xhr.getResponseHeader("Retry-After");
            const delay = retryAfter
              ? parseInt(retryAfter, 10) * 1000
              : getRetryDelay(retryCount);
            reject(new Error(`Rate limited:${delay}`));
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          clearTimeout(timeoutId);
          abortControllersRef.current.delete(file);
          reject(new Error("Network error"));
        });

        xhr.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          abortControllersRef.current.delete(file);
          reject(new Error("Upload aborted"));
        });

        xhr.open("POST", "/api/files");
        xhr.send(formData);
      });
    },
    [],
  );

  const uploadWithRetry = useCallback(
    async (file: File): Promise<any> => {
      let lastError: Error | null = null;

      for (
        let retryCount = 0;
        retryCount <= UPLOAD_CONFIG.maxRetries;
        retryCount++
      ) {
        try {
          if (retryCount > 0) {
            setUploads((prev) =>
              prev.map((upload) =>
                upload.file === file
                  ? {
                      ...upload,
                      status: "uploading" as const,
                      progress: 0,
                      retryCount,
                      error: `Retrying (${retryCount}/${UPLOAD_CONFIG.maxRetries})...`,
                    }
                  : upload,
              ),
            );
            const delay = getRetryDelay(retryCount - 1);
            await sleep(delay);
          }

          const result = await uploadSingleFile(file, retryCount);

          setUploads((prev) =>
            prev.map((upload) => {
              if (upload.file === file) {
                const { error: _, ...rest } = upload;
                return {
                  ...rest,
                  status: "completed" as const,
                  progress: 100,
                };
              }
              return upload;
            }),
          );

          return result;
        } catch (error) {
          lastError = error as Error;
          const errorMessage = lastError.message;

          if (errorMessage.startsWith("Rate limited:")) {
            const customDelay = parseInt(errorMessage.split(":")[1] || "0", 10);
            if (!isNaN(customDelay) && customDelay > 0) {
              await sleep(customDelay);
              retryCount--;
              continue;
            }
          }

          if (
            errorMessage === "Upload cancelled" ||
            errorMessage === "Upload aborted"
          ) {
            break;
          }

          console.warn(
            `Upload attempt ${retryCount + 1} failed for ${file.name}:`,
            errorMessage,
          );
        }
      }

      setUploads((prev) =>
        prev.map((upload) =>
          upload.file === file
            ? {
                ...upload,
                status: "error" as const,
                error: lastError?.message || "Upload failed after retries",
              }
            : upload,
        ),
      );

      throw lastError || new Error("Upload failed");
    },
    [uploadSingleFile],
  );

  const processQueue = useCallback(async () => {
    while (
      uploadQueueRef.current.length > 0 &&
      activeUploadsRef.current < UPLOAD_CONFIG.concurrentUploads
    ) {
      const file = uploadQueueRef.current.shift();
      if (!file) break;

      activeUploadsRef.current++;

      setUploads((prev) =>
        prev.map((upload) =>
          upload.file === file
            ? { ...upload, status: "uploading" as const, progress: 0 }
            : upload,
        ),
      );

      uploadWithRetry(file)
        .then((result) => {
          successfulUploadsRef.current.push(result);
        })
        .catch((error) => {
          console.error(`Failed to upload ${file.name}:`, error);
        })
        .finally(() => {
          activeUploadsRef.current--;

          processQueue();

          if (
            activeUploadsRef.current === 0 &&
            uploadQueueRef.current.length === 0
          ) {
            if (successfulUploadsRef.current.length > 0) {
              onUploadComplete?.([...successfulUploadsRef.current]);
              window.dispatchEvent(new CustomEvent("fileUploaded"));
              successfulUploadsRef.current = [];
            }
          }
        });
    }
  }, [uploadWithRetry, onUploadComplete]);

  const handleFiles = useCallback(
    (files: File[]) => {
      const validFiles: File[] = [];
      const newUploads: ExtendedFileUploadProgress[] = [];

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
          retryCount: 0,
        });

        if (!multiple) break;
      }

      setUploads((prev) => [...prev, ...newUploads]);

      uploadQueueRef.current.push(...validFiles);
      processQueue();
    },
    [multiple, processQueue],
  );

  const retryUpload = useCallback(
    (file: File) => {
      setUploads((prev) =>
        prev.map((upload) => {
          if (upload.file === file) {
            const { error: _, ...rest } = upload;
            return {
              ...rest,
              status: "pending" as const,
              progress: 0,
            };
          }
          return upload;
        }),
      );

      uploadQueueRef.current.push(file);
      processQueue();
    },
    [processQueue],
  );

  const removeUpload = useCallback((file: File) => {
    const controller = abortControllersRef.current.get(file);
    if (controller) {
      controller.abort();
    }

    uploadQueueRef.current = uploadQueueRef.current.filter((f) => f !== file);

    setUploads((prev) => prev.filter((upload) => upload.file !== file));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter((upload) => upload.status !== "completed"),
    );
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (upload: ExtendedFileUploadProgress) => {
    switch (upload.status) {
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
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
            : "border-border",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
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
            or click to browse from your device
          </p>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        multiple={multiple}
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,application/*,.zip,.rar,.7z,.tar,.gz"
      />

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
            onClick={(e) => {
              e?.stopPropagation();
              setIsQRModalOpen(true);
            }}
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
                  key={`${upload.file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-lg"
                >
                  <div className="flex-shrink-0">{getStatusIcon(upload)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {upload.file.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {upload.status === "error" && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <button
                              type="button"
                              onClick={() => retryUpload(upload.file)}
                              className="h-6 w-6 p-0 inline-flex items-center justify-center text-foreground hover:bg-primary/5 rounded-lg transition-colors"
                              aria-label="Retry upload"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                          </motion.div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUpload(upload.file)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(upload.file.size)}</span>
                      <span>-</span>
                      <span className="capitalize">
                        {getFileCategory(upload.file.type)}
                      </span>
                      {upload.retryCount !== undefined &&
                        upload.retryCount > 0 && (
                          <>
                            <span>-</span>
                            <span className="text-yellow-500">
                              Retry {upload.retryCount}/
                              {UPLOAD_CONFIG.maxRetries}
                            </span>
                          </>
                        )}
                      {upload.error && !upload.error.startsWith("Retrying") && (
                        <>
                          <span>-</span>
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
