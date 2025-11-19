"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { KeyboardShortcut } from "~/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  unregisterShortcuts: (keys: string[]) => void;
  showHelpModal: () => void;
  hideHelpModal: () => void;
  isHelpModalOpen: boolean;
  formatShortcut: (shortcut: KeyboardShortcut) => string;
}

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextType | undefined
>(undefined);

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.shiftKey) parts.push("Shift");
    if (shortcut.altKey) parts.push("Alt");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  }, []);

  const registerShortcuts = useCallback((newShortcuts: KeyboardShortcut[]) => {
    setShortcuts((prev) => {
      const filtered = prev.filter(
        (s) =>
          !newShortcuts.some(
            (n) =>
              n.key === s.key &&
              n.ctrlKey === s.ctrlKey &&
              n.shiftKey === s.shiftKey &&
              n.altKey === s.altKey,
          ),
      );
      return [...filtered, ...newShortcuts];
    });
  }, []);

  const unregisterShortcuts = useCallback((keys: string[]) => {
    setShortcuts((prev) => prev.filter((s) => !keys.includes(s.key)));
  }, []);

  const showHelpModal = useCallback(() => {
    setIsHelpModalOpen(true);
  }, []);

  const hideHelpModal = useCallback(() => {
    setIsHelpModalOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        showHelpModal();
        return;
      }

      for (const shortcut of shortcuts) {
        const keyLower = event.key.toLowerCase();
        const shortcutKeyLower = shortcut.key.toLowerCase();

        if (keyLower !== shortcutKeyLower) continue;

        const needsCtrl = shortcut.ctrlKey || shortcut.metaKey;
        const hasCtrl = event.ctrlKey || event.metaKey;

        if (needsCtrl !== hasCtrl) continue;
        if ((shortcut.shiftKey ?? false) !== event.shiftKey) continue;
        if ((shortcut.altKey ?? false) !== event.altKey) continue;

        event.preventDefault();
        shortcut.callback();
        break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, showHelpModal]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcuts,
        unregisterShortcuts,
        showHelpModal,
        hideHelpModal,
        isHelpModalOpen,
        formatShortcut,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error(
      "useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider",
    );
  }
  return context;
}
