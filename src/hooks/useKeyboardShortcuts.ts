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
