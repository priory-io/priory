"use client";

import { useState } from "react";
import Button from "~/components/ui/button";
import {
  CreateShortlinkFormProps,
  CreateShortlinkData,
} from "~/types/shortlink";

export function CreateShortlinkForm({
  onSubmit,
  onCancel,
  loading = false,
}: CreateShortlinkFormProps) {
  const [formData, setFormData] = useState<CreateShortlinkData>({
    originalUrl: "",
    customCode: "",
    title: "",
    description: "",
    password: "",
    expiresAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = (field: keyof CreateShortlinkData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Original URL *
          </label>
          <input
            type="url"
            required
            value={formData.originalUrl}
            onChange={(e) => updateField("originalUrl", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="https://example.com"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Custom Code
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={formData.customCode}
            onChange={(e) => updateField("customCode", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="my-link"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Title
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Link title"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Password
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Password protect this link"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-rows-1 lg:grid-rows-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Expires At
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => updateField("expiresAt", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            disabled={loading}
          />
        </div>
        <div className="space-y-2 -mt-6">
          <label className="block text-sm font-medium text-foreground">
            Description
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
            placeholder="Link description"
            rows={3}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" disabled={loading} className="sm:order-2">
          {loading ? "Creating..." : "Create Shortlink"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="sm:order-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
