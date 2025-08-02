"use client";

import { LogOut } from "lucide-react";
import { UserAvatar } from "~/components/navbar/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { authClient } from "~/lib/auth-client";
import { UserMenuItems } from "~/components/navbar/user-menu-items";
import { ThemeToggle } from "~/components/navbar/theme-toggle";

interface UserAvatarDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null | undefined;
  };
}

export function UserAvatarDropdown({ user }: UserAvatarDropdownProps) {
  const handleSignOut = () => {
    authClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all hover:ring-2 hover:ring-primary/50">
          <UserAvatar user={user} size={32} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <UserMenuItems />
        <DropdownMenuSeparator />
        <ThemeToggle />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
