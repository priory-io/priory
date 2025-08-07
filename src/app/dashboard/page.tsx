"use client";

import { authClient } from "~/lib/auth-client";
import { DashboardLayout } from "~/components/dashboard/layout";
import { AccountOverview } from "~/components/dashboard/account-overview";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>

        <AccountOverview user={session.user} />

        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 pt-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
              Update profile information
            </button>
            <button className="w-full text-left px-4 py-2 pt-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
              Change password
            </button>
            <button className="w-full text-left px-4 py-2 pt-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
              Manage notifications
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
