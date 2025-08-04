"use client";

import { useState } from "react";
import {
  Copy,
  Download,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
  MoreVertical,
  File,
  Image,
  Video,
  Music,
  Archive,
  FileText,
} from "lucide-react";
import Button from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FileData, getFileCategory } from "~/types/file";

interface FileCardProps {
  file: FileData;
  onCopy: (url: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newFilename: string) => void;
}

export function FileCard({ file, onCopy, onDelete, onRename }: FileCardProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newFilename, setNewFilename] = useState(file.filename);

  const getFileIcon = (mimeType: string) => {
    const category = getFileCategory(mimeType);
    const iconClass = "w-12 h-12 flex-shrink-0";

    switch (category) {
      case "image":
        return <Image className={`${iconClass} text-blue-500`} />;
      case "video":
        return <Video className={`${iconClass} text-red-500`} />;
      case "audio":
        return <Music className={`${iconClass} text-purple-500`} />;
      case "archive":
        return <Archive className={`${iconClass} text-orange-500`} />;
      case "application":
        return <FileText className={`${iconClass} text-green-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleRename = () => {
    onRename(file.id, newFilename);
    setShowRenameDialog(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      onDelete(file.id);
    }
  };

  const handleCopyUrl = () => {
    const shareUrl = `${window.location.origin}/${file.id}`;
    onCopy(shareUrl);
  };

  const handleOpen = () => {
    if (file.url) {
      window.open(file.url, "_blank");
    }
  };

  const handleDownload = async () => {
    if (!file.url) return;

    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(file.url, "_blank");
    }
  };

  const renderPreview = () => {
    const category = getFileCategory(file.mimeType);

    if (category === "image") {
      return (
        <div className="w-full aspect-video bg-muted rounded-t-xl overflow-hidden">
          <img
            src={file.url}
            alt={file.filename}
            className="w-full h-full object-cover"
            onError={(e) => {
              const fallback =
                e.currentTarget.parentElement?.querySelector(".fallback-icon");
              if (fallback) {
                e.currentTarget.style.display = "none";
                fallback.classList.remove("hidden");
              }
            }}
          />
          <div className="fallback-icon hidden w-full h-full flex items-center justify-center bg-muted">
            {getFileIcon(file.mimeType)}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video bg-muted rounded-t-xl flex items-center justify-center">
        {getFileIcon(file.mimeType)}
      </div>
    );
  };

  return (
    <>
      <div className="border border-border/50 rounded-xl overflow-hidden hover:bg-card/80 transition-colors group">
        {renderPreview()}

        <div className="p-4">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm truncate">
                {file.filename}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleOpen}>
                  <ExternalLink className="w-4 h-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="w-4 h-4" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
                  <Edit className="w-4 h-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(file.createdAt).toLocaleDateString()}
            </span>
            <span className="capitalize">{getFileCategory(file.mimeType)}</span>
          </div>

          {file.originalFilename !== file.filename && (
            <p className="text-xs text-muted-foreground truncate mt-2">
              Original: {file.originalFilename}
            </p>
          )}
        </div>
      </div>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filename
              </label>
              <input
                type="text"
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Enter new filename"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename();
                  } else if (e.key === "Escape") {
                    setShowRenameDialog(false);
                  }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRenameDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={!newFilename.trim()}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
