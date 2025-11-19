"use client";

import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { authClient } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import Button from "~/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";
import { AnalyticsDashboard } from "~/components/dashboard/analytics";
import { ShortlinkCard } from "~/components/shortlinks/shortlink-card";
import { CreateShortlinkForm } from "~/components/shortlinks/create-shortlink-form";
import { BulkOperationsToolbar } from "~/components/ui/bulk-operations-toolbar";
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
import { type KeyboardShortcut } from "~/hooks/useKeyboardShortcuts";
import { useKeyboardShortcutsContext } from "~/components/keyboard-shortcuts-provider";

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
  const [selectedShortlinks, setSelectedShortlinks] = useState<Set<string>>(
    new Set(),
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const { registerShortcuts } = useKeyboardShortcutsContext();

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

  const handleShortlinkSelection = useCallback(
    (shortlinkId: string, selected: boolean) => {
      setSelectedShortlinks((prev) => {
        const newSelection = new Set(prev);
        if (selected) {
          newSelection.add(shortlinkId);
        } else {
          newSelection.delete(shortlinkId);
        }
        return newSelection;
      });
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedShortlinks(new Set(shortlinks.map((link) => link.id)));
  }, [shortlinks]);

  const handleClearSelection = useCallback(() => {
    setSelectedShortlinks(new Set());
    setSelectionMode(false);
  }, []);

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "n",
        ctrlKey: true,
        metaKey: true,
        callback: () => createDialogRef.current?.click(),
        description: "Create new shortlink",
        category: "actions",
      },
      {
        key: "s",
        ctrlKey: true,
        metaKey: true,
        callback: () => setSelectionMode((prev) => !prev),
        description: "Toggle selection mode",
        category: "selection",
      },
      {
        key: "a",
        ctrlKey: true,
        metaKey: true,
        callback: () => {
          setSelectedShortlinks(new Set(shortlinks.map((link) => link.id)));
        },
        description: "Select all shortlinks",
        category: "selection",
      },
      {
        key: "Escape",
        callback: () => {
          handleClearSelection();
        },
        description: "Clear selection",
        category: "general",
      },
    ];

    registerShortcuts(shortcuts);
  }, [registerShortcuts, shortlinks, handleClearSelection]);

  const handleBulkDelete = useCallback(async () => {
    const shortlinkIds = Array.from(selectedShortlinks);
    if (shortlinkIds.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${shortlinkIds.length} shortlink${shortlinkIds.length > 1 ? "s" : ""}?`;
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch("/api/shortlinks/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlinkIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete shortlinks");
      }

      const result = await res.json();

      addToast({
        type: "success",
        title: "Shortlinks deleted",
        description: `Successfully deleted ${result.deletedCount} shortlink${result.deletedCount > 1 ? "s" : ""}.`,
      });

      setSelectedShortlinks(new Set());
      setSelectionMode(false);
      await mutate(swrKey);
    } catch (error) {
      console.error(`Failed to delete shortlinks: ${error}`);
      addToast({
        type: "error",
        title: "Failed to delete shortlinks",
        description: "Please try again.",
      });
    }
  }, [selectedShortlinks, addToast, swrKey]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedShortlinks(new Set());
    }
  }, [selectionMode]);

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
  if (!session?.user) redirect("/auth/signin");

  return (
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleSelectionMode}
            className="gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            {selectionMode ? "Cancel Selection" : "Select Links"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto"
                ref={createDialogRef}
                aria-label="Create shortlink"
              >
                <Plus className="w-4 h-4" />
                Create Shortlink
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
      </div>

      <AnalyticsDashboard refreshTrigger={shortlinks.length} />

      {selectionMode && (
        <BulkOperationsToolbar
          selectedCount={selectedShortlinks.size}
          totalCount={shortlinks.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          type="shortlinks"
        />
      )}

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
                isSelected={selectedShortlinks.has(link.id)}
                onSelectionChange={handleShortlinkSelection}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
