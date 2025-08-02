"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
