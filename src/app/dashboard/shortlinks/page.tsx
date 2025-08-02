"use client";

import { useState, useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { DashboardLayout } from "~/components/dashboard/layout";
import { redirect } from "next/navigation";
import Button from "~/components/ui/button";
import { Plus, Copy, Eye, Trash2, Calendar, Lock } from "lucide-react";
import { AnalyticsDashboard } from "~/components/dashboard/analytics";

interface Shortlink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  description?: string;
  password?: string;
  expiresAt?: string;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
}

export default function ShortlinksPage() {
  const { data: session, isPending } = authClient.useSession();
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    originalUrl: "",
    customCode: "",
    title: "",
    description: "",
    password: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (session?.user) {
      fetchShortlinks();
    }
  }, [session]);

  const fetchShortlinks = async () => {
    try {
      const response = await fetch("/api/shortlinks");
      if (response.ok) {
        const data = await response.json();
        setShortlinks(data.shortlinks);
      }
    } catch (error) {
      console.error("Error fetching shortlinks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createShortlink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shortlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          originalUrl: "",
          customCode: "",
          title: "",
          description: "",
          password: "",
          expiresAt: "",
        });
        setShowCreateForm(false);
        fetchShortlinks();
      }
    } catch (error) {
      console.error("Error creating shortlink:", error);
    }
  };

  const deleteShortlink = async (id: string) => {
    try {
      const response = await fetch(`/api/shortlinks?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchShortlinks();
      }
    } catch (error) {
      console.error("Error deleting shortlink:", error);
    }
  };

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Shortlinks
            </h1>
            <p className="text-muted-foreground">
              Manage your shortened URLs and view analytics.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="mt-1">Create Shortlink</span>
          </Button>
        </div>

        {showCreateForm && (
          <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Create New Shortlink
            </h3>
            <form onSubmit={createShortlink} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Original URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.originalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, originalUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Custom Code (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customCode}
                    onChange={(e) =>
                      setFormData({ ...formData, customCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="my-link"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Link title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Password protect this link"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Link description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expires At (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit"><span className="mt-1">Create Shortlink</span></Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  <span className="mt-1">
                    Cancel
                  </span>
                </Button>
              </div>
            </form>
          </div>
        )}

        <AnalyticsDashboard />

        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Your Shortlinks
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : shortlinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shortlinks created yet. Create your first one above!
            </div>
          ) : (
            <div className="space-y-4">
              {shortlinks.map((link) => (
                <div
                  key={link.id}
                  className="border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-primary">
                          /{link.shortCode}
                        </span>
                        {link.password && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        {link.expiresAt && (
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      {link.title && (
                        <h4 className="font-medium text-foreground mb-1">
                          {link.title}
                        </h4>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {link.originalUrl}
                      </p>
                      {link.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {link.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {link.clickCount} clicks
                        </span>
                        <span>
                          Created{" "}
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.shortCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteShortlink(link.id)}
                        className="text-destructive hover:text-distructive/85"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
