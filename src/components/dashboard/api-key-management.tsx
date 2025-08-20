"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "~/components/ui/button";
import { useToast } from "~/components/ui/toast";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Calendar,
  Activity,
  Power,
  PowerOff,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

export default function ApiKeyManagement() {
  const { addToast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyData, setNewKeyData] = useState<{
    key: string;
    name: string;
  } | null>(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    permissions: ["files:upload", "shortlinks:create"],
    expiresAt: "",
  });

  const loadApiKeys = async () => {
    try {
      const response = await fetch("/api/account/api-keys");
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error("Failed to load API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!createForm.name.trim()) {
      addToast({
        type: "error",
        title: "Validation error",
        description: "API key name is required",
      });
      return;
    }

    try {
      const response = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create API key");
      }

      const newKey = await response.json();
      setNewKeyData({ key: newKey.key, name: newKey.name });

      setCreateForm({
        name: "",
        permissions: ["files:upload", "shortlinks:create"],
        expiresAt: "",
      });
      setIsCreating(false);

      await loadApiKeys();

      addToast({
        type: "success",
        title: "API key created",
        description: "Your new API key has been generated",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Creation failed",
        description:
          error instanceof Error ? error.message : "Failed to create API key",
      });
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to delete the API key "${keyName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/account/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete API key");
      }

      await loadApiKeys();

      addToast({
        type: "success",
        title: "API key deleted",
        description: `API key "${keyName}" has been deleted`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Deletion failed",
        description:
          error instanceof Error ? error.message : "Failed to delete API key",
      });
    }
  };

  const handleToggleKey = async (keyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/account/api-keys/${keyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update API key");
      }

      await loadApiKeys();

      addToast({
        type: "success",
        title: "API key updated",
        description: `API key ${!currentStatus ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update API key",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        type: "success",
        title: "Copied!",
        description: "API key copied to clipboard",
      });
    } catch {
      addToast({
        type: "error",
        title: "Copy failed",
        description: "Failed to copy to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Key className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
            <p className="text-sm text-muted-foreground">
              Manage your API keys for programmatic access
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          disabled={isCreating}
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </Button>
      </div>

      <AnimatePresence>
        {newKeyData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border border-border/50 rounded-xl p-4 bg-card/50 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">
                  API Key Created: {newKeyData.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Make sure to copy your API key now. You won't be able to see
                  it again!
                </p>
                <div className="p-3 bg-background/50 border border-border/40 rounded-lg font-mono text-sm text-foreground">
                  {newKeyData.key}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newKeyData.key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewKeyData(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border border-border/50 rounded-xl p-4 bg-background/50 hover:bg-card/80 transition-colors"
          >
            <h4 className="font-medium text-foreground mb-4">
              Create New API Key
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                  placeholder="My API Key"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {[
                    { id: "files:upload", label: "Upload Files" },
                    { id: "shortlinks:create", label: "Create Shortlinks" },
                  ].map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={createForm.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCreateForm({
                              ...createForm,
                              permissions: [
                                ...createForm.permissions,
                                permission.id,
                              ],
                            });
                          } else {
                            setCreateForm({
                              ...createForm,
                              permissions: createForm.permissions.filter(
                                (p) => p !== permission.id,
                              ),
                            });
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">
                        {permission.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={createForm.expiresAt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateKey} size="sm">
                  Create Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setCreateForm({
                      name: "",
                      permissions: ["files:upload", "shortlinks:create"],
                      expiresAt: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No API keys created yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first API key to get started
            </p>
          </div>
        ) : (
          apiKeys.map((key) => (
            <motion.div
              key={key.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-border/50 rounded-xl p-4 bg-card/50 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-foreground">{key.name}</h4>
                    <div className="flex items-center gap-2">
                      {key.isActive ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          <Power className="w-3 h-3" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                          <PowerOff className="w-3 h-3" />
                          Disabled
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-muted/50 px-2 py-1 rounded text-xs">
                        {key.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </span>
                      {key.lastUsedAt && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Last used{" "}
                          {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                      {key.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires {new Date(key.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {key.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded text-xs"
                        >
                          {permission.replace(":", ": ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleKey(key.id, key.isActive)}
                  >
                    {key.isActive ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteKey(key.id, key.name)}
                    className="text-destructive hover:text-destructive/85"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
