"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authClient } from "~/lib/auth-client";
import { DashboardLayout } from "~/components/dashboard/layout";
import { redirect } from "next/navigation";
import Card from "~/components/ui/card";
import Button from "~/components/ui/button";
import Link from "next/link";
import {
  User,
  Link as LinkIcon,
  FolderOpen,
  TrendingUp,
  Settings,
  Activity,
  MessageSquare,
  Clock,
  Shield,
  Zap,
  Globe,
  FileText,
  ExternalLink,
} from "lucide-react";

interface DashboardStats {
  filesCount: number;
  shortlinksCount: number;
  totalViews: number;
  activeLinks: number;
  filesChange: string;
  shortlinksChange: string;
  viewsChange: string;
  activePercentage: number;
  storageUsed: number;
  storageLimit: number;
  filesStorage: number;
}

export default function DashboardOverviewPage() {
  const { data: session, isPending } = authClient.useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to refresh dashboard stats:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadDashboardStats();
    }
  }, [session?.user]);

  useEffect(() => {
    const handleFileUploaded = () => {
      refreshStats();
    };

    window.addEventListener("fileUploaded", handleFileUploaded);
    return () => window.removeEventListener("fileUploaded", handleFileUploaded);
  }, []);

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;

  const statsData = stats
    ? [
        {
          title: "Files Uploaded",
          value: (stats.filesCount ?? 0).toString(),
          change: stats.filesChange ?? "No change",
          icon: FolderOpen,
          colorClass: "text-chart-1",
          bgClass: "bg-chart-1/10",
        },
        {
          title: "Shortlinks Created",
          value: (stats.shortlinksCount ?? 0).toString(),
          change: stats.shortlinksChange ?? "No change",
          icon: LinkIcon,
          colorClass: "text-chart-2",
          bgClass: "bg-chart-2/10",
        },
        {
          title: "Total Views",
          value: (stats.totalViews ?? 0).toLocaleString(),
          change: stats.viewsChange ?? "No change",
          icon: TrendingUp,
          colorClass: "text-chart-3",
          bgClass: "bg-chart-3/10",
        },
        {
          title: "Active Links",
          value: (stats.activeLinks ?? 0).toString(),
          change: `${stats.activePercentage ?? 0}% active`,
          icon: Activity,
          colorClass: "text-chart-4",
          bgClass: "bg-chart-4/10",
        },
      ]
    : [];

  const features = [
    {
      title: "Secure File Storage",
      description: "Upload and share files with advanced security features",
      icon: Shield,
      href: "/dashboard/files",
    },
    {
      title: "Smart Shortlinks",
      description: "Create custom shortlinks with analytics and tracking",
      icon: Zap,
      href: "/dashboard/shortlinks",
    },
    {
      title: "Global CDN",
      description: "Fast worldwide access to your content",
      icon: Globe,
      href: "#",
    },
    {
      title: "Usage Analytics",
      description: "Detailed insights into your content performance",
      icon: FileText,
      href: "#",
    },
  ];

  const motd = {
    title: "Welcome to Priory",
    message:
      "Your secure file sharing and link management platform is ready to use. Start by uploading files or creating shortlinks.",
    timestamp: new Date().toISOString(),
    priority: "info" as const,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Here's what's happening with your account today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {motd.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(motd.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{motd.message}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.bgClass} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Platform Features
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore what Priory has to offer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <Link key={feature.title} href={feature.href} className="group">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 bg-card/30 hover:bg-primary/5 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {feature.title}
                          </h4>
                          {feature.href !== "#" && (
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-chart-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Storage Usage
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your storage consumption
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {stats.storageUsed >= 1073741824
                      ? `${((stats.storageUsed ?? 0) / 1024 / 1024 / 1024).toFixed(1)} GB`
                      : `${((stats.storageUsed ?? 0) / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{" "}
                    {(
                      (stats.storageLimit ?? 10737418240) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(0)}{" "}
                    GB
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Files</span>
                    <span className="text-foreground">
                      {stats.filesStorage >= 1073741824
                        ? `${((stats.filesStorage ?? 0) / 1024 / 1024 / 1024).toFixed(1)} GB`
                        : `${((stats.filesStorage ?? 0) / 1024 / 1024).toFixed(1)} MB`}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-chart-1 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((stats.filesStorage ?? 0) / (stats.storageLimit ?? 10737418240)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/dashboard/files">
                    <Button variant="outline" size="sm">
                      Manage Files
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/account">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                  Manage Account
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
