import { config } from "~/lib/config";

export interface FileData {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export const ALLOWED_MIME_TYPES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  video: ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"],
  audio: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/flac"],
  application: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ],
  archive: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
    "application/x-tar",
  ],
} as const;

export const MAX_FILE_SIZE = config.storage.maxFileSize;

export function isAllowedMimeType(mimeType: string): boolean {
  return Object.values(ALLOWED_MIME_TYPES).some((types) =>
    (types as readonly string[]).includes(mimeType),
  );
}

export function getFileCategory(mimeType: string): string {
  for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
    if ((types as readonly string[]).includes(mimeType)) {
      return category;
    }
  }
  return "unknown";
}

export function sanitizeFilename(filename: string): string {
  const extension = filename.split(".").pop() || "";
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_\s]/g, "")
    .replace(/\s+/g, "_");
  return extension ? `${sanitized}.${extension}` : sanitized;
}
