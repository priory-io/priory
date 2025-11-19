"use client";

import { LogIn } from "lucide-react";
import { UserAvatarDropdown } from "~/components/navbar/user-avatar-dropdown";
import Link from "next/link";
import { config } from "~/lib/config";

interface AuthSectionProps {
  session: any;
}

export function AuthSection({ session }: AuthSectionProps) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <UserAvatarDropdown user={session.user} />
      </div>
    );
  }

  if (config.features.maintenanceMode) {
    return null;
  }

  return (
    <Link
      href="/auth/signin"
      className="group relative text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </div>
    </Link>
  );
}
