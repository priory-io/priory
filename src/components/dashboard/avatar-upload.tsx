"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X } from "lucide-react";
import { UserAvatar } from "~/components/navbar/user-avatar";
import Button from "~/components/ui/button";
import { useToast } from "~/components/ui/toast";

interface AvatarUploadProps {
  user: {
    id: string;
    name?: string | null | undefined;
    image?: string | null | undefined;
    avatarUrl?: string | null | undefined;
  };
  onAvatarUpdate: (avatarUrl: string) => void;
}

export default function AvatarUpload({
  user,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(
    user.avatarUrl || "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    setCurrentAvatarUrl(user.avatarUrl || "");
  }, [user.avatarUrl]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast({
        type: "error",
        title: "Invalid file type",
        description: "Please select an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: "error",
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload avatar");
      }

      const data = await response.json();
      setCurrentAvatarUrl(data.avatarUrl);
      onAvatarUpdate(data.avatarUrl);

      addToast({
        type: "success",
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload avatar",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    setIsUploading(true);

    try {
      const response = await fetch("/api/account/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove avatar");
      }

      setCurrentAvatarUrl("");
      onAvatarUpdate("");

      addToast({
        type: "success",
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Remove failed",
        description:
          error instanceof Error ? error.message : "Failed to remove avatar",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group">
        <UserAvatar
          user={{
            ...user,
            avatarUrl: currentAvatarUrl,
          }}
          size={80}
          className="border-2 border-border"
        />

        <div
          className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer ${
            isUploading ? "opacity-100" : ""
          }`}
          onClick={openFileDialog}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4" />
          {currentAvatarUrl ? "Change" : "Upload"}
        </Button>

        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={removeAvatar}
            disabled={isUploading}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
