"use client";

import { useState, useCallback } from "react";
import { debounce } from "~/lib/utils";

export function useSearch(initialValue = "", delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, delay),
    [delay],
  );

  const updateSearchTerm = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch],
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    clearSearch,
  };
}
