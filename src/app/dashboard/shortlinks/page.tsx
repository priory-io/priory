"use client";

import { useMemo, useCallback, useRef } from "react";
import useSWR, { mutate } from "swr";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Shortlink, CreateShortlinkData } from "~/types/shortlink";

const fetcher = (url: string, signal?: AbortSignal) =>
  fetch(url, signal ? { signal } : {}).then(async (r) => {
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      const msg = data?.error || `Request failed: ${r.status}`;
      throw new Error(msg);
    }
    return r.json();
  });

export default function ShortlinksPage() {
  const { data: session, isPending } = authClient.useSession();
  const { addToast } = useToast();
  const createDialogRef = useRef<HTMLButtonElement | null>(null);

  const aborter = useRef<AbortController | null>(null);
  const swrKey = session?.user ? "/api/shortlinks" : null;

  const { data, error, isLoading } = useSWR<{
    shortlinks: Shortlink[];
  }>(
    swrKey,
    async (key: string) => {
      aborter.current?.abort();
      aborter.current = new AbortController();
      return fetcher(key, aborter.current.signal);
    },
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  );

  const shortlinks = useMemo(() => data?.shortlinks ?? [], [data]);

  const closeCreateDialog = useCallback(() => {
    createDialogRef.current?.click();
  }, []);

  const createShortlink = useCallback(
    async (formData: CreateShortlinkData) => {
      try {
        const res = await fetch("/api/shortlinks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to create shortlink");
        }

        addToast({
          type: "success",
          title: "Shortlink created",
          description: "Your new shortlink is ready.",
        });

        await mutate(swrKey);
        closeCreateDialog();
      } catch (e) {
        addToast({
          type: "error",
          title: "Failed to create shortlink",
          description:
            e instanceof Error ? e.message : "Please try again shortly.",
        });
      }
    },
    [addToast, closeCreateDialog, swrKey],
  );

  const deleteShortlink = useCallback(
    async (id: string) => {
      if (!swrKey) return;

      const prev = data;

      mutate(
        swrKey,
        (current: { shortlinks: Shortlink[] } | undefined) => {
          if (!current) return current;
          return {
            shortlinks: current.shortlinks.filter((l) => l.id !== id),
          };
        },
        false,
      );

      try {
        const res = await fetch(`/api/shortlinks?id=${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Delete failed");
        }

        addToast({
          type: "success",
          title: "Shortlink deleted",
          description: "The shortlink has been removed.",
        });

        await mutate(swrKey);
      } catch {
        mutate(swrKey, prev, false);
        addToast({
          type: "error",
          title: "Failed to delete",
          description: "Please try again.",
        });
      }
    },
    [addToast, data, swrKey],
  );

  const copyToClipboard = useCallback(
    async (shortCode: string) => {
      try {
        const url = new URL(shortCode, window.location.origin).toString();
        await navigator.clipboard.writeText(url);
        addToast({
          type: "success",
          title: "Copied",
          description: "Link copied to clipboard.",
        });
      } catch {
        addToast({
          type: "error",
          title: "Copy failed",
          description: "Please copy it manually.",
        });
      }
    },
    [addToast],
  );

  if (isPending) return <LoadingPage />;
  if (!session?.user) redirect("/");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Shortlinks
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your shortened URLs and view analytics.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto"
                ref={createDialogRef}
                aria-label="Create shortlink"
              >
                <Plus className="w-4 h-4" />
                <span className="translate-y-px">Create Shortlink</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Shortlink</DialogTitle>
              </DialogHeader>
              <CreateShortlinkForm
                onSubmit={createShortlink}
                onCancel={closeCreateDialog}
              />
            </DialogContent>
          </Dialog>
        </div>

        <AnalyticsDashboard refreshTrigger={shortlinks.length} />

        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Your Shortlinks
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
          ) : error ? (
            <EmptyState
              title="Failed to load"
              description="We couldn't load your shortlinks. Try again."
              actionText="Retry"
              onAction={() => mutate(swrKey)}
            />
          ) : shortlinks.length === 0 ? (
            <EmptyState
              title="No shortlinks yet"
              description="Create your first shortlink to get started."
              actionText="Create Shortlink"
              onAction={() => createDialogRef.current?.click()}
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
