"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Settings,
} from "lucide-react";
import { formatBytes, bytesToGB } from "~/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: Date;
  uploadLimitBytes: number | null;
  totalUploadedBytes: number;
}

interface EditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, uploadLimitGB: number | null) => Promise<void>;
}

function EditUploadLimitModal({
  user,
  isOpen,
  onClose,
  onSave,
}: EditModalProps) {
  const [limitGB, setLimitGB] = useState<string>(
    user.uploadLimitBytes ? bytesToGB(user.uploadLimitBytes).toFixed(1) : "",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const limitBytes =
        limitGB === "" || limitGB === "0"
          ? null
          : Math.round(parseFloat(limitGB) * 1024 * 1024 * 1024);
      await onSave(user.id, limitBytes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Edit Upload Limit
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              User
            </label>
            <p className="text-muted-foreground">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Usage
            </label>
            <p className="text-muted-foreground">
              {formatBytes(user.totalUploadedBytes)}
              {user.uploadLimitBytes && (
                <span>
                  {" "}
                  / {formatBytes(user.uploadLimitBytes)} (
                  {Math.round(
                    (user.totalUploadedBytes / user.uploadLimitBytes) * 100,
                  )}
                  %)
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Limit (GB)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={limitGB}
              onChange={(e) => setLimitGB(e.target.value)}
              placeholder="Leave empty for unlimited"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty or enter 0 for unlimited uploads
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.ok) {
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, isAdmin: !currentStatus } : u,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update admin status:", error);
    }
  };

  const updateUploadLimit = async (
    userId: string,
    uploadLimitBytes: number | null,
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/upload-limit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadLimitBytes }),
      });

      if (response.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, uploadLimitBytes } : u)),
        );
      }
    } catch (error) {
      console.error("Failed to update upload limit:", error);
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
          User Management
        </h2>

        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No users found.
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/40"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{u.name}</h3>
                      {u.isAdmin && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        {u.emailVerified ? (
                          <UserCheck className="w-3 h-3 text-green-500" />
                        ) : (
                          <UserX className="w-3 h-3 text-red-500" />
                        )}
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      Upload: {formatBytes(u.totalUploadedBytes)}
                      {u.uploadLimitBytes ? (
                        <span>
                          {" "}
                          / {formatBytes(u.uploadLimitBytes)} (
                          {Math.round(
                            (u.totalUploadedBytes / u.uploadLimitBytes) * 100,
                          )}
                          %)
                        </span>
                      ) : (
                        <span> / Unlimited</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Limit
                  </button>

                  <button
                    onClick={() => toggleAdminStatus(u.id, u.isAdmin)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      u.isAdmin
                        ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {u.isAdmin ? "Remove Admin" : "Make Admin"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingUser && (
        <EditUploadLimitModal
          user={editingUser}
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSave={updateUploadLimit}
        />
      )}
    </div>
  );
}
