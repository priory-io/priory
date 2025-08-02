"use client";

import { LogIn } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { UserAvatarDropdown } from "~/components/navbar/user-avatar-dropdown";

interface AuthSectionProps {
  session: any;
}

export function AuthSection({ session }: AuthSectionProps) {
  const handleSignIn = () => {
    authClient.signIn.social({
      provider: "github",
    });
  };

  if (session?.user) {
    return <UserAvatarDropdown user={session.user} />;
  }

  return (
    <button
      onClick={handleSignIn}
      className="group relative text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <LogIn className="w-4 h-4" />
        <span className="translate-y-[2px]">Sign In</span>
      </div>
    </button>
  );
}
