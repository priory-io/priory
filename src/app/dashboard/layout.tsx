"use client";

import { ReactNode } from "react";
import { authClient } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/dashboard/layout";

interface DashboardRootLayoutProps {
  children: ReactNode;
}

export default function DashboardRootLayout({
  children,
}: DashboardRootLayoutProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
