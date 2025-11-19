"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  LogOut,
  Link as LinkIcon,
  Shield,
  FolderOpen,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { useSidebar } from "./sidebar-context";
import { useKeyboardShortcutsContext } from "../keyboard-shortcuts-provider";

const navigationItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Files",
    href: "/dashboard/files",
    icon: FolderOpen,
  },
  {
    name: "Shortlinks",
    href: "/dashboard/shortlinks",
    icon: LinkIcon,
  },
  {
    name: "Account",
    href: "/dashboard/account",
    icon: User,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { shouldAnimate, isAdmin } = useSidebar();
  const { showHelpModal } = useKeyboardShortcutsContext();

  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <motion.aside
      className="w-64 bg-card/50 backdrop-blur-xl border-r border-border/60 h-full"
      initial={shouldAnimate ? { x: -20, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
    >
      <div className="p-6">
        <div className="mb-4 ml-4">
          <Link href="/" className="text-3xl font-semibold text-foreground">
            Priory
          </Link>
        </div>
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
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-1 h-1 bg-primary rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`flex items-center gap-3 px-4 pt-2 pb-2 rounded-lg transition-all duration-200 group ${
                pathname === "/dashboard/admin"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin</span>
              {pathname === "/dashboard/admin" && (
                <motion.div
                  className="ml-auto w-1 h-1 bg-primary rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </Link>
          )}
        </nav>

        <div className="mt-6 pt-6 border-t border-border/60">
          <button
            onClick={showHelpModal}
            className="flex items-center gap-3 px-4 pb-2 pt-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-primary/5 w-full cursor-pointer mb-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium">Shortcuts</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 pb-2 pt-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-destructive/5 w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
