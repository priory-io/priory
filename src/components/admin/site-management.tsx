"use client";

import { useState } from "react";
import { Database, Trash2, Download, AlertTriangle } from "lucide-react";

export function SiteManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDatabaseCleanup = async () => {
    if (
      !confirm(
        "This will remove inactive shortlinks older than 30 days. Continue?",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Cleanup completed. Removed ${result.deletedCount} items.`);
      }
    } catch (error) {
      console.error("Failed to cleanup database:", error);
      alert("Cleanup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/export");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `priory-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Site Management
        </h2>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">
            Data Management
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Export Data</div>
                <div className="text-sm opacity-80">
                  Download all site data as JSON
                </div>
              </div>
            </button>

            <button
              onClick={handleDatabaseCleanup}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors disabled:opacity-50"
            >
              <Database className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Database Cleanup</div>
                <div className="text-sm opacity-80">
                  Remove old inactive data
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          System Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Version</span>
            <div className="font-medium text-foreground">v1.0.0</div>
          </div>

          <div>
            <span className="text-muted-foreground">Environment</span>
            <div className="font-medium text-foreground">
              {process.env.NODE_ENV || "development"}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground">Database</span>
            <div className="font-medium text-foreground">PostgreSQL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
