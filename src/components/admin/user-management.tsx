"use client";

import { useEffect, useState } from "react";
import { Crown, UserCheck, UserX, Mail, Calendar } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{u.name}</h3>
                      {u.isAdmin && (
                        <Crown className="w-4 h-4 mb-1.5 text-yellow-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 mb-1" />
                        {u.email}
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 mb-1" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        {u.emailVerified ? (
                          <UserCheck className="w-3 h-3 mb-1 text-green-500" />
                        ) : (
                          <UserX className="w-3 h-3 mb-1 text-red-500" />
                        )}
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </div>
                    </div>
                  </div>
                </div>

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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
