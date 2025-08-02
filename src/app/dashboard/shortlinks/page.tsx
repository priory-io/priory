"use client";

import { useState, useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { DashboardLayout } from "~/components/dashboard/layout";
import { redirect } from "next/navigation";
import Button from "~/components/ui/button";
import { Plus } from "lucide-react";
import { AnalyticsDashboard } from "~/components/dashboard/analytics";
import { ShortlinkCard } from "~/components/shortlinks/shortlink-card";
import { CreateShortlinkForm } from "~/components/shortlinks/create-shortlink-form";
import { EmptyState } from "~/components/ui/empty-state";
import { LoadingPage, LoadingSpinner } from "~/components/ui/loading";
import { useToast } from "~/components/ui/toast";
import { Shortlink, CreateShortlinkData } from "~/types/shortlink";

export default function ShortlinksPage() {
  const { data: session, isPending } = authClient.useSession();
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [analyticsRefreshTrigger, setAnalyticsRefreshTrigger] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    if (session?.user) {
      fetchShortlinks();
    }
  }, [session]);

  const triggerAnalyticsRefresh = () => {
    setAnalyticsRefreshTrigger((prev) => prev + 1);
  };

  const fetchShortlinks = async () => {
    try {
      const response = await fetch("/api/shortlinks");
      if (response.ok) {
        const data = await response.json();
        setShortlinks(data.shortlinks);
      } else {
        addToast({
          type: "error",
          title: "Failed to fetch shortlinks",
          description: "Please try refreshing the page.",
        });
      }
    } catch (error) {
      console.error("Error fetching shortlinks:", error);
      addToast({
        type: "error",
        title: "Failed to fetch shortlinks",
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createShortlink = async (formData: CreateShortlinkData) => {
    setSubmitLoading(true);

    try {
      const response = await fetch("/api/shortlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        await fetchShortlinks();
        triggerAnalyticsRefresh();
        addToast({
          type: "success",
          title: "Shortlink created successfully",
          description: "Your new shortlink is ready to use.",
        });
      } else {
        const errorData = await response.json();
        addToast({
          type: "error",
          title: "Failed to create shortlink",
          description: errorData.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating shortlink:", error);
      addToast({
        type: "error",
        title: "Failed to create shortlink",
        description: "Please check your connection and try again.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };
  const deleteShortlink = async (id: string) => {
    try {
      const response = await fetch(`/api/shortlinks?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchShortlinks();
        triggerAnalyticsRefresh();
        addToast({
          type: "success",
          title: "Shortlink deleted",
          description: "The shortlink has been removed successfully.",
        });
      } else {
        addToast({
          type: "error",
          title: "Failed to delete shortlink",
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting shortlink:", error);
      addToast({
        type: "error",
        title: "Failed to delete shortlink",
        description: "Please check your connection and try again.",
      });
    }
  };

  const copyToClipboard = async (shortCode: string) => {
    try {
      const url = `${window.location.origin}/${shortCode}`;
      await navigator.clipboard.writeText(url);
      addToast({
        type: "success",
        title: "Link copied to clipboard",
        description: "You can now paste it anywhere.",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      addToast({
        type: "error",
        title: "Failed to copy link",
        description: "Please try copying manually.",
      });
    }
  };

  if (isPending) {
    return <LoadingPage />;
  }

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Shortlinks
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your shortened URLs and view analytics.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Shortlink
          </Button>
        </div>

        {showCreateForm && (
          <CreateShortlinkForm
            onSubmit={createShortlink}
            onCancel={() => setShowCreateForm(false)}
            loading={submitLoading}
          />
        )}

        <AnalyticsDashboard refreshTrigger={analyticsRefreshTrigger} />

        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Your Shortlinks
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
          ) : shortlinks.length === 0 ? (
            <EmptyState
              title="No shortlinks yet"
              description="Create your first shortlink to get started with link management and analytics."
              actionText="Create Shortlink"
              onAction={() => setShowCreateForm(true)}
            />
          ) : (
            <div className="space-y-4">
              {shortlinks.map((link) => (
                <ShortlinkCard
                  key={link.id}
                  shortlink={link}
                  onCopy={copyToClipboard}
                  onDelete={deleteShortlink}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
