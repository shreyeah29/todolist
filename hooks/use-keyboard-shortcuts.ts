"use client";

import { useEffect } from "react";

import { useUiStore } from "@/stores/ui-store";

type ShortcutMap = Record<string, () => void>;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  useEffect(() => {
    const shortcuts: ShortcutMap = {
      "meta+k": () => setCommandPaletteOpen(true),
      "ctrl+k": () => setCommandPaletteOpen(true),
      "meta+\\": () => toggleSidebar(),
      "ctrl+\\": () => toggleSidebar(),
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const parts = [
        event.metaKey ? "meta" : null,
        event.ctrlKey ? "ctrl" : null,
        event.shiftKey ? "shift" : null,
        key,
      ].filter(Boolean);
      const combo = parts.join("+");

      if (shortcuts[combo]) {
        event.preventDefault();
        shortcuts[combo]();
        return;
      }

      if (isEditableTarget(event.target)) return;

      if (key === "n" && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        // New task — wired in Planner step
        window.dispatchEvent(new CustomEvent("toso:new-task"));
      }

      if (key === "n" && event.shiftKey && !event.metaKey && !event.ctrlKey) {
        window.dispatchEvent(new CustomEvent("toso:new-note"));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen, toggleSidebar]);
}
