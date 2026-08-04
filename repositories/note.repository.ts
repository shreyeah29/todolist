import type { SupabaseClient } from "@supabase/supabase-js";

import { NotFoundError } from "@/lib/errors";
import type { Folder, Note } from "@/types/database";

const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export async function listFolders(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("created_by", userId)
    .is("deleted_at", null)
    .eq("is_archived", false)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Folder[];
}

export async function listNotes(
  supabase: SupabaseClient,
  userId: string,
  opts: { folderId?: string | null; search?: string; limit?: number } = {},
) {
  let query = supabase
    .from("notes")
    .select("*")
    .eq("created_by", userId)
    .is("deleted_at", null)
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(opts.limit ?? 100);

  if (opts.folderId) {
    query = query.eq("folder_id", opts.folderId);
  }
  if (opts.search?.trim()) {
    query = query.or(
      `title.ilike.%${opts.search.trim()}%,content_text.ilike.%${opts.search.trim()}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Note[];
}

export async function getNote(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("created_by", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Note not found");
  return data as Note;
}

export async function insertNote(
  supabase: SupabaseClient,
  userId: string,
  payload: { title?: string; folder_id?: string | null },
) {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: payload.title?.trim() || "Untitled",
      folder_id: payload.folder_id ?? null,
      content: EMPTY_DOC,
      content_text: "",
      created_by: userId,
      last_edited_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Note;
}

export async function updateNoteRow(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  payload: Partial<Note>,
) {
  const { data, error } = await supabase
    .from("notes")
    .update({
      ...payload,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", userId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) throw error;
  return data as Note;
}

export async function softDeleteNote(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("notes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Note;
}

export function deriveTextStats(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned ? cleaned.split(" ").length : 0;
  const characters = cleaned.length;
  const reading_time_min = Math.max(1, Math.ceil(words / 200));
  return { word_count: words, character_count: characters, reading_time_min };
}
