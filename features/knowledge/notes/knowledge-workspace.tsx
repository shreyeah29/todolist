"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Folder, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { TipTapEditor } from "@/components/editors/tiptap-editor";
import { ResizablePanels } from "@/components/layout/resizable-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createNote,
  fetchFolders,
  fetchNote,
  fetchNotes,
  updateNote,
} from "@/features/knowledge/notes/actions";
import { cn } from "@/lib/utils";

type KnowledgeWorkspaceProps = {
  noteId?: string;
};

export function KnowledgeWorkspace({ noteId }: KnowledgeWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const foldersQuery = useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const result = await fetchFolders();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const notesQuery = useQuery({
    queryKey: ["notes", folderId, search],
    queryFn: async () => {
      const result = await fetchNotes({ folderId, search });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const noteQuery = useQuery({
    queryKey: ["note", noteId],
    enabled: Boolean(noteId),
    queryFn: async () => {
      const result = await fetchNote(noteId!);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await createNote({
        title: "Untitled",
        folder_id: folderId,
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push(`/knowledge/${note.id}`);
      toast.success("Note created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <ResizablePanels
      leftDefaultSize={30}
      rightDefaultSize={70}
      left={
        <div className="glass border-border/50 flex h-full min-h-[520px] flex-col rounded-2xl border">
          <div className="flex items-center gap-2 border-b p-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes"
                className="pl-8"
              />
            </div>
            <Button
              size="icon-sm"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              aria-label="New note"
            >
              <FilePlus2 className="size-4" />
            </Button>
          </div>

          <div className="max-h-40 overflow-y-auto border-b p-2">
            <button
              type="button"
              onClick={() => setFolderId(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm",
                folderId === null ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <Folder className="size-3.5" />
              All notes
            </button>
            {foldersQuery.data?.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setFolderId(folder.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm",
                  folderId === folder.id ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <Folder className="size-3.5" />
                {folder.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {notesQuery.isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              notesQuery.data?.map((note) => (
                <Link
                  key={note.id}
                  href={`/knowledge/${note.id}`}
                  className={cn(
                    "hover:bg-muted/70 block rounded-xl px-3 py-2 transition-colors",
                    noteId === note.id && "bg-muted",
                  )}
                >
                  <p className="truncate text-sm font-medium">{note.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {note.content_text || "Empty note"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      }
      right={
        <div className="glass border-border/50 min-h-[520px] rounded-2xl border p-5 md:p-6">
          {!noteId ? (
            <div className="text-muted-foreground flex h-full min-h-[400px] flex-col items-start justify-center gap-3">
              <p className="font-heading text-foreground text-lg font-semibold">
                Select or create a note
              </p>
              <Button onClick={() => createMutation.mutate()}>New note</Button>
            </div>
          ) : noteQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : noteQuery.data ? (
            <div className="space-y-4">
              <Input
                value={noteQuery.data.title}
                onChange={async (e) => {
                  const title = e.target.value;
                  queryClient.setQueryData(["note", noteId], {
                    ...noteQuery.data,
                    title,
                  });
                  const result = await updateNote({ id: noteId, title });
                  if (!result.success) toast.error(result.error.message);
                  else queryClient.invalidateQueries({ queryKey: ["notes"] });
                }}
                className="font-heading border-0 bg-transparent text-2xl font-semibold shadow-none focus-visible:ring-0"
              />
              <p className="text-muted-foreground text-xs">
                {noteQuery.data.word_count} words ·{" "}
                {noteQuery.data.reading_time_min} min read · autosaves
              </p>
              <TipTapEditor
                key={noteQuery.data.id}
                initialContent={noteQuery.data.content}
                onChange={async ({ content, contentText }) => {
                  const result = await updateNote({
                    id: noteId,
                    content,
                    content_text: contentText,
                  });
                  if (!result.success) {
                    toast.error(result.error.message);
                    return;
                  }
                  queryClient.setQueryData(["note", noteId], result.data);
                  queryClient.invalidateQueries({ queryKey: ["notes"] });
                }}
              />
            </div>
          ) : (
            <p className="text-destructive text-sm">Note not found.</p>
          )}
        </div>
      }
    />
  );
}
