"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Link as LinkIcon,
  MousePointer,
  TrendingUp,
} from "lucide-react";

interface SiteStats {
  totalUsers: number;
  totalShortlinks: number;
  totalClicks: number;
  activeShortlinks: number;
  verifiedUsers: number;
  adminUsers: number;
  recentActivity: {
    newUsersToday: number;
    newShortlinksToday: number;
    clicksToday: number;
  };
}

export function SiteStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load statistics.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      subtext: `${stats.verifiedUsers} verified, ${stats.adminUsers} admin`,
    },
    {
      title: "Total Shortlinks",
      value: stats.totalShortlinks,
      icon: LinkIcon,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      subtext: `${stats.activeShortlinks} active`,
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks,
      icon: MousePointer,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      subtext: "All time",
    },
    {
      title: "Daily Activity",
      value: stats.recentActivity.clicksToday,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      subtext: "Clicks today",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {card.value.toLocaleString()}
                </h3>
                <p className="text-sm font-medium text-foreground mb-1">
                  {card.title}
                </p>
                <p className="text-xs text-muted-foreground">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Today's Activity
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New Users</span>
              <span className="font-medium text-foreground">
                {stats.recentActivity.newUsersToday}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">New Shortlinks</span>
              <span className="font-medium text-foreground">
                {stats.recentActivity.newShortlinksToday}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Clicks</span>
              <span className="font-medium text-foreground">
                {stats.recentActivity.clicksToday}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            System Health
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Shortlinks</span>
              <span className="text-green-500 font-medium">
                {(
                  (stats.activeShortlinks / stats.totalShortlinks) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Verified Users</span>
              <span className="text-green-500 font-medium">
                {((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Admin Users</span>
              <span className="font-medium text-foreground">
                {stats.adminUsers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
