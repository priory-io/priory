"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  MousePointer,
} from "lucide-react";

interface Shortlink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  description: string | null;
  isActive: boolean;
  clickCount: number;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
}

export function ShortlinkManagement() {
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShortlinks();
  }, []);

  const fetchShortlinks = async () => {
    try {
      const response = await fetch("/api/admin/shortlinks");
      if (response.ok) {
        const data = await response.json();
        setShortlinks(data);
      }
    } catch (error) {
      console.error("Failed to fetch shortlinks:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (
    shortlinkId: string,
    currentStatus: boolean,
  ) => {
    try {
      const response = await fetch(
        `/api/admin/shortlinks/${shortlinkId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        },
      );

      if (response.ok) {
        setShortlinks(
          shortlinks.map((s) =>
            s.id === shortlinkId ? { ...s, isActive: !currentStatus } : s,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update shortlink status:", error);
    }
  };

  const deleteShortlink = async (shortlinkId: string) => {
    if (!confirm("Are you sure you want to delete this shortlink?")) return;

    try {
      const response = await fetch(`/api/admin/shortlinks/${shortlinkId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShortlinks(shortlinks.filter((s) => s.id !== shortlinkId));
      }
    } catch (error) {
      console.error("Failed to delete shortlink:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Shortlink Management
        </h2>

        <div className="space-y-4">
          {shortlinks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No shortlinks found.
            </p>
          ) : (
            shortlinks.map((link) => (
              <div
                key={link.id}
                className="p-4 bg-background/50 rounded-lg border border-border/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-mono">
                        /{link.shortCode}
                      </code>

                      {!link.isActive && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-foreground">
                        {link.title || "Untitled"}
                      </h3>

                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {link.originalUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {link.description && (
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" />
                        {link.clickCount} clicks
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(link.createdAt).toLocaleDateString()}
                      </div>

                      <span>by {link.user.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleActiveStatus(link.id, link.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        link.isActive
                          ? "text-green-500 hover:bg-green-500/10"
                          : "text-gray-500 hover:bg-gray-500/10"
                      }`}
                      title={link.isActive ? "Deactivate" : "Activate"}
                    >
                      {link.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteShortlink(link.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
