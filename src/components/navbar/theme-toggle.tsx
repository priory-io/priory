"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
      {theme === "dark" ? (
        <Sun className="mr-2 h-4 w-4" />
      ) : (
        <Moon className="mr-2 h-4 w-4" />
      )}
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </DropdownMenuItem>
  );
}
