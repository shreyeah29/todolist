"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FilePlus2, ListPlus } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/lib/constants";
import { useUiStore } from "@/stores/ui-store";

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search navigation and quick actions"
      className="glass border-border/60 overflow-hidden sm:max-w-lg"
    >
      <Command className="bg-transparent">
        <CommandInput
          placeholder="Search pages, actions..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.href}`}
                onSelect={() => run(item.href)}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick actions">
            <CommandItem
              value="new task"
              onSelect={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent("toso:new-task"));
                router.push("/planner");
              }}
            >
              <ListPlus className="size-4" />
              <span>New task</span>
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="new note"
              onSelect={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent("toso:new-note"));
                router.push("/knowledge");
              }}
            >
              <FilePlus2 className="size-4" />
              <span>New note</span>
              <CommandShortcut>⇧N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
