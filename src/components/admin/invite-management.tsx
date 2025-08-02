"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Users,
  Clock,
} from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  maxUses: number | null;
  currentUses: number;
  expiresAt: Date | null;
  isActive: boolean;
  description: string | null;
  createdAt: Date;
  createdBy: {
    name: string;
    email: string;
  };
}

interface CreateInviteForm {
  maxUses: string;
  expiresInDays: string;
  description: string;
}

export function InviteManagement() {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInviteForm>({
    maxUses: "",
    expiresInDays: "",
    description: "",
  });

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/admin/invites");
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async () => {
    try {
      const payload: Record<string, unknown> = {};

      if (createForm.maxUses) {
        payload["maxUses"] = parseInt(createForm.maxUses);
      }
      if (createForm.expiresInDays) {
        payload["expiresInDays"] = parseInt(createForm.expiresInDays);
      }
      if (createForm.description) {
        payload["description"] = createForm.description;
      }

      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setCreateForm({ maxUses: "", expiresInDays: "", description: "" });
        fetchInvites();
      }
    } catch (error) {
      console.error("Failed to create invite:", error);
    }
  };
  const toggleInviteStatus = async (
    inviteId: string,
    currentStatus: boolean,
  ) => {
    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setInvites(
          invites.map((inv) =>
            inv.id === inviteId ? { ...inv, isActive: !currentStatus } : inv,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update invite status:", error);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to delete this invite code?")) return;

    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInvites(invites.filter((inv) => inv.id !== inviteId));
      }
    } catch (error) {
      console.error("Failed to delete invite:", error);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      console.log("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Invite Code Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invite
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border/40">
            <h3 className="font-medium text-foreground mb-4">
              Create New Invite Code
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Max Uses (optional)
                </label>
                <input
                  type="number"
                  value={createForm.maxUses}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, maxUses: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Expires in Days (optional)
                </label>
                <input
                  type="number"
                  value={createForm.expiresInDays}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      expiresInDays: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="Never"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="Purpose of this invite"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={createInvite}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Invite
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No invite codes found.
            </p>
          ) : (
            invites.map((invite) => (
              <div
                key={invite.id}
                className="p-4 bg-background/50 rounded-lg border border-border/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                        {invite.code}
                      </code>

                      <button
                        onClick={() => copyToClipboard(invite.code)}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {!invite.isActive && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </div>

                    {invite.description && (
                      <p className="text-sm text-foreground">
                        {invite.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {invite.currentUses}
                        {invite.maxUses ? `/${invite.maxUses}` : ""} uses
                      </div>

                      {invite.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires{" "}
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created{" "}
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </div>

                      <span>by {invite.createdBy.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() =>
                        toggleInviteStatus(invite.id, invite.isActive)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        invite.isActive
                          ? "text-green-500 hover:bg-green-500/10"
                          : "text-gray-500 hover:bg-gray-500/10"
                      }`}
                      title={invite.isActive ? "Deactivate" : "Activate"}
                    >
                      {invite.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteInvite(invite.id)}
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
