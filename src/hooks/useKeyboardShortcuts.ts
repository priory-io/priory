import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description: string;
  category: "navigation" | "actions" | "selection" | "general";
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {},
) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (
        isInputElement &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey
      ) {
        return;
      }

      for (const shortcut of shortcutsRef.current) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch =
          (event.ctrlKey || event.metaKey) === (shortcut.ctrlKey ?? false);
        const shiftMatch = event.shiftKey === (shortcut.shiftKey ?? false);
        const altMatch = event.altKey === (shortcut.altKey ?? false);

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    },
    [enabled, preventDefault],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.shiftKey) parts.push("Shift");
    if (shortcut.altKey) parts.push("Alt");
    if (shortcut.metaKey) parts.push("Cmd");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  }, []);

  return { formatShortcut };
}

export const commonShortcuts = {
  SAVE: { key: "s", ctrlKey: true, metaKey: true },
  DELETE: { key: "Delete" },
  ESCAPE: { key: "Escape" },
  ENTER: { key: "Enter" },
  UPLOAD: { key: "u", ctrlKey: true, metaKey: true },
  SEARCH: { key: "f", ctrlKey: true, metaKey: true },
  SELECT_ALL: { key: "a", ctrlKey: true, metaKey: true },
  DESELECT: { key: "Escape" },
  COPY: { key: "c", ctrlKey: true, metaKey: true },
};
