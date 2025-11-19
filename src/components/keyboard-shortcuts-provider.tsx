"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  KeyboardShortcut,
  useKeyboardShortcuts,
} from "~/hooks/useKeyboardShortcuts";

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
  const { formatShortcut } = useKeyboardShortcuts(shortcuts);

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
