"use client";

import { User, Settings, Shield } from "lucide-react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

export function UserMenuItems() {
  return (
    <>
      <DropdownMenuItem className="cursor-pointer">
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
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
