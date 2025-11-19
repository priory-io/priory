"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useKeyboardShortcutsContext } from "./keyboard-shortcuts-provider";
import { KeyboardShortcut } from "~/hooks/useKeyboardShortcuts";

export function KeyboardShortcutsModal() {
  const { shortcuts, hideHelpModal, isHelpModalOpen, formatShortcut } =
    useKeyboardShortcutsContext();

  const categorizedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const cat = shortcut.category || "general";
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>,
  );

  const categoryLabels: Record<string, string> = {
    general: "General",
    navigation: "Navigation",
    actions: "Actions",
    selection: "Selection",
  };

  return (
    <Dialog
      open={isHelpModalOpen}
      onOpenChange={(open) => {
        if (!open) hideHelpModal();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const categoryShortcuts = categorizedShortcuts[category];
            if (!categoryShortcuts || categoryShortcuts.length === 0)
              return null;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {label}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={`${shortcut.key}-${index}`}
                      className="flex items-center justify-between px-3 py-2 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-foreground bg-primary/10 border border-primary/20 rounded">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {shortcuts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No keyboard shortcuts available yet.</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="inline px-1 py-0.5 bg-secondary rounded text-foreground font-semibold">
              Ctrl + K
            </kbd>{" "}
            to open this dialog anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
