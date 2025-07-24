"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useSearch } from "~/hooks/useSearch";
import { cn } from "~/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  onSearch,
  className,
}: SearchInputProps) {
  const { searchTerm, debouncedSearchTerm, updateSearchTerm, clearSearch } =
    useSearch();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className={cn("relative flex items-center group", className)}>
      <Search
        className={cn(
          "absolute left-3 w-4 h-4 transition-colors pointer-events-none",
          isFocused ? "text-primary" : "text-muted-foreground",
        )}
      />

      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => updateSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full pl-10 pr-10 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-xl",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50",
          "placeholder:text-muted-foreground transition-all",
          isFocused && "bg-card/70",
        )}
      />

      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute right-3 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
