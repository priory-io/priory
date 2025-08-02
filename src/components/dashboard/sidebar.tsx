"use client";

import { motion } from "framer-motion";
import { User, LogOut, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "~/lib/auth-client";

const navigationItems = [
  {
    name: "Account",
    href: "/dashboard",
    icon: User,
  },
  {
    name: "Shortlinks",
    href: "/dashboard/shortlinks",
    icon: LinkIcon,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <motion.aside
      className="w-64 bg-card/50 backdrop-blur-xl border-r border-border/60 h-full"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Dashboard
        </h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 pt-2 pb-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium mt-1">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-1 h-1 bg-primary rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-border/60">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 pb-2 pt-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-destructive/5 w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium mt-1">Sign Out</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
