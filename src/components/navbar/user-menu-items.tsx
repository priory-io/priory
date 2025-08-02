"use client";

import { User, Settings, Shield } from "lucide-react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import Link from "next/link";

export function UserMenuItems() {
  return (
    <>
      <DropdownMenuItem asChild className="cursor-pointer">
        <Link href="/dashboard">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <Shield className="mr-2 h-4 w-4" />
        <span>Security</span>
      </DropdownMenuItem>
    </>
  );
}
