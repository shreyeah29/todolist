"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FilePlus2, ListPlus, Search } from "lucide-react";

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
import { globalSearch } from "@/features/search/actions";
import { NAV_ITEMS } from "@/lib/constants";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUiStore } from "@/stores/ui-store";

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const [hits, setHits] = useState<
    Array<{
      entity_type: string;
      entity_id: string;
      title: string;
      subtitle: string | null;
    }>
  >([]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHits([]);
    }
  }, [open]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (debounced.trim().length < 2) {
        if (active) setHits([]);
        return;
      }
      const result = await globalSearch(debounced.trim());
      if (!active) return;
      if (result.success) setHits(result.data);
      else setHits([]);
    }
    void run();
    return () => {
      active = false;
    };
  }, [debounced]);

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const openHit = (type: string, id: string) => {
    if (type === "task") run("/planner");
    else if (type === "note") run(`/knowledge/${id}`);
    else if (type === "folder") run("/knowledge");
    else run("/dashboard");
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search navigation and quick actions"
      className="glass border-border/60 overflow-hidden sm:max-w-lg"
    >
      <Command className="bg-transparent" shouldFilter={hits.length === 0}>
        <CommandInput
          placeholder="Search everything…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {hits.length > 0 ? (
            <CommandGroup heading="Results">
              {hits.map((hit) => (
                <CommandItem
                  key={`${hit.entity_type}-${hit.entity_id}`}
                  value={`${hit.title} ${hit.entity_type}`}
                  onSelect={() => openHit(hit.entity_type, hit.entity_id)}
                >
                  <Search className="size-4" />
                  <div className="min-w-0">
                    <p className="truncate">{hit.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {hit.entity_type}
                      {hit.subtitle ? ` · ${hit.subtitle}` : ""}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
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
