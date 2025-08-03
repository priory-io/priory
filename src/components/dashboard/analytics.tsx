"use client";

import React, { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Button from "~/components/ui/button";

interface AnalyticsData {
  totalClicks: Array<{
    shortlinkId: string;
    shortCode: string;
    title: string | null;
    clicks: number;
  }>;
  dailyClicks: Array<{
    date: string;
    clicks: number;
  }>;
}

interface AnalyticsDashboardProps {
  refreshTrigger?: number;
}

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const res = await fetch(url, { signal: controller.signal });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return (res.json() as Promise<AnalyticsData>);
};

export function AnalyticsDashboard({
  refreshTrigger,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState(30);

  const key = useMemo(() => {
    const params = new URLSearchParams({ days: String(timeRange) });
    if (refreshTrigger !== undefined) {
      params.set("r", String(refreshTrigger));
    }
    return `/api/analytics?${params.toString()}`;
  }, [timeRange, refreshTrigger]);

  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(key, fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
    refreshWhenHidden: false,
    refreshInterval: () =>
      typeof document !== "undefined" && !document.hidden ? 30000 : 0,
  });

  const getTimeRangeLabel = useCallback((days: number) => {
    if (days === 7) return "Last 7 days";
    if (days === 30) return "Last 30 days";
    if (days === 90) return "Last 90 days";
    return "Last 30 days";
  }, []);

  const analytics = data;
  const totalClicks =
    analytics?.totalClicks.reduce((sum, item) => sum + item.clicks, 0) || 0;
  const totalLinks = analytics?.totalClicks.length || 0;
  const avgClicksPerLink =
    totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  const maxDaily = useMemo(() => {
    if (!analytics?.dailyClicks?.length) return 1;
    return Math.max(1, ...analytics.dailyClicks.map((d) => d.clicks));
  }, [analytics?.dailyClicks]);

  return (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Overview
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                {getTimeRangeLabel(timeRange)}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setTimeRange(7)}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeRange(30)}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeRange(90)}>
                Last 90 days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Failed to load analytics. Please try again.
            </p>
            <Button variant="outline" onClick={() => mutate()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-primary-foreground border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold text-chart-3">
                    {totalClicks}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-chart-3" />
              </div>
            </div>

            <div className="bg-primary-foreground border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Links</p>
                  <p className="text-2xl font-bold text-chart-2">
                    {totalLinks}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-chart-2" />
              </div>
            </div>

            <div className="bg-primary-foreground border border-border rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Link</p>
                  <p className="text-2xl font-bold text-chart-1">
                    {avgClicksPerLink}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-chart-1" />
              </div>
            </div>
          </div>
        )}
      </div>

      {analytics?.totalClicks && analytics.totalClicks.length > 0 && (
        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            Top Performing Links
          </h4>
          <div className="space-y-3">
            {analytics.totalClicks.slice(0, 5).map((item, index) => (
              <div
                key={item.shortlinkId}
                className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium pt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-mono text-sm text-primary">
                      /{item.shortCode}
                    </p>
                    {item.title && (
                      <p className="text-sm text-muted-foreground">
                        {item.title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{item.clicks}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics?.dailyClicks && analytics.dailyClicks.length > 0 && (
        <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            Daily Clicks Trend
          </h4>
          <div className="space-y-2">
            {analytics.dailyClicks.slice(-7).map((item) => {
              const ratio = item.clicks / maxDaily;
              const widthPx = Math.max(10, Math.round(160 * ratio));
              return (
                <div
                  key={item.date}
                  className="flex items-center justify-between p-2"
                >
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${widthPx}px` }}
                    />
                    <span className="text-sm font-medium text-foreground w-8 text-right">
                      {item.clicks}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
