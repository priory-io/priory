"use client";

import { authClient } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { UserManagement } from "~/components/admin/user-management";
import { ShortlinkManagement } from "~/components/admin/shortlink-management";
import { SiteStats } from "~/components/admin/site-stats";
import { SiteManagement } from "~/components/admin/site-management";
import { InviteManagement } from "~/components/admin/invite-management";
import {
  Users,
  Link as LinkIcon,
  BarChart3,
  Settings,
  UserPlus,
} from "lucide-react";

const adminSections = [
  {
    id: "stats",
    name: "Statistics",
    icon: BarChart3,
    component: SiteStats,
  },
  {
    id: "users",
    name: "Users",
    icon: Users,
    component: UserManagement,
  },
  {
    id: "shortlinks",
    name: "Shortlinks",
    icon: LinkIcon,
    component: ShortlinkManagement,
  },
  {
    id: "invites",
    name: "Invites",
    icon: UserPlus,
    component: InviteManagement,
  },
  {
    id: "settings",
    name: "Site Settings",
    icon: Settings,
    component: SiteManagement,
  },
];

export default function AdminDashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeSection, setActiveSection] = useState("stats");

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/auth/admin-check");
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
            if (!data.isAdmin) {
              redirect("/dashboard");
            }
          }
        } catch (error) {
          console.error("Failed to check admin status:", error);
          redirect("/dashboard");
        } finally {
          setIsChecking(false);
        }
      } else if (!isPending) {
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.id, isPending]);

  if (isPending || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/");
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const ActiveComponent = adminSections.find(
    (section) => section.id === activeSection,
  )?.component;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage users, content, and site settings.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border/60 overflow-x-auto">
        {adminSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.name}
            </button>
          );
        })}
      </div>

      <div className="min-h-[600px]">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
