"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import Button from "~/components/ui/button";
import Container from "~/components/ui/container";
import { cn } from "~/lib/utils";
import {
  FileUploadProgress,
  isAllowedMimeType,
  MAX_FILE_SIZE,
  getFileCategory,
} from "~/types/file";

function QRUploadContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("session");

  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [sessionInfo, setSessionInfo] = useState<{
    uploadCount: number;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionToken) {
        setError("No session token provided");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/files/qr-session/${sessionToken}`);

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Invalid session");
          setIsValidating(false);
          return;
        }

        const data = await response.json();
        setSessionInfo({
          uploadCount: data.uploadCount || 0,
          expiresAt: data.expiresAt,
        });
        setIsValid(true);
      } catch (err) {
        console.error("Session validation error:", err);
        setError("Failed to validate session");
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [sessionToken]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = "";
  };

  const handleFiles = (files: File[]) => {
    if (!isValid || !sessionToken) return;

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
    }

    setUploads((prev) => [...prev, ...newUploads]);
    uploadFiles(validFiles);
  };

  const uploadFiles = async (files: File[]) => {
    if (!sessionToken) return;

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

          xhr.open("POST", `/api/files/qr-session/${sessionToken}`);
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
      await Promise.allSettled(uploadPromises);
      if (sessionToken) {
        const response = await fetch(`/api/files/qr-session/${sessionToken}`);
        if (response.ok) {
          const data = await response.json();
          setSessionInfo({
            uploadCount: data.uploadCount || 0,
            expiresAt: data.expiresAt,
          });
        }
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

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Container maxWidth="md">
          <motion.div
            className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-8 text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">
              Invalid Session
            </h1>
            <p className="text-muted-foreground">{error}</p>
            <Button href="/" variant="outline" className="w-full">
              Back to Home
            </Button>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <Container maxWidth="md">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Upload Files</h1>
            <p className="text-muted-foreground">
              Drag and drop files or tap to browse
            </p>
            {sessionInfo && (
              <p className="text-xs text-muted-foreground/60">
                Files uploaded: {sessionInfo.uploadCount}
              </p>
            )}
          </div>

          <div
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
          >
            <div
              className={cn(
                "transition-all duration-200",
                isDragging && "scale-110",
              )}
            >
              <Upload
                className={cn(
                  "mx-auto h-12 w-12 mb-4 transition-colors duration-200",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <div className="space-y-3">
              <p
                className={cn(
                  "text-lg font-semibold transition-colors duration-200",
                  isDragging ? "text-primary" : "text-foreground",
                )}
              >
                {isDragging ? "Drop your files here" : "Drag & drop files here"}
              </p>
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
                    multiple
                    onChange={handleFileSelect}
                    accept="image/*,video/*,audio/*,application/*,.zip,.rar,.7z,.tar,.gz"
                  />
                </label>
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

              <div className="space-y-2 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {uploads.map((upload, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
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
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}

export default QRUploadContent;
