import {
  createNoteRecord,
  db,
  getLocalUserId,
  logLocalActivity,
  now,
} from "@/lib/db/local";
import { NotFoundError } from "@/lib/errors";
import type { Note } from "@/types/database";

export function deriveTextStats(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned ? cleaned.split(" ").length : 0;
  const characters = cleaned.length;
  const reading_time_min = Math.max(1, Math.ceil(words / 200) || 0);
  return {
    word_count: words,
    character_count: characters,
    reading_time_min: words === 0 ? 0 : reading_time_min,
  };
}

export async function listFolders() {
  const userId = await getLocalUserId();
  const rows = await db.folders
    .where("created_by")
    .equals(userId)
    .filter((folder) => folder.deleted_at === null && !folder.is_archived)
    .toArray();
  return rows.sort((a, b) => a.position - b.position);
}

export async function listNotes(
  opts: { folderId?: string | null; search?: string; limit?: number } = {},
) {
  const userId = await getLocalUserId();
  let rows = await db.notes
    .where("created_by")
    .equals(userId)
    .filter((note) => note.deleted_at === null && !note.is_archived)
    .toArray();

  if (opts.folderId) {
    rows = rows.filter((note) => note.folder_id === opts.folderId);
  }
  if (opts.search?.trim()) {
    const q = opts.search.trim().toLowerCase();
    rows = rows.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content_text.toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });

  return rows.slice(0, opts.limit ?? 100);
}

export async function getNote(id: string) {
  const userId = await getLocalUserId();
  const note = await db.notes.get(id);
  if (!note || note.created_by !== userId || note.deleted_at) {
    throw new NotFoundError("Note not found");
  }
  return note;
}

export async function insertNote(payload: {
  title?: string;
  folder_id?: string | null;
}) {
  const userId = await getLocalUserId();
  const note = createNoteRecord(userId, payload);
  await db.notes.add(note);
  await logLocalActivity(userId, "note.created", "note", note.id);
  return note;
}

export async function updateNoteRow(id: string, payload: Partial<Note>) {
  const userId = await getLocalUserId();
  const current = await getNote(id);
  const next: Note = {
    ...current,
    ...payload,
    id: current.id,
    created_by: current.created_by,
    created_at: current.created_at,
    updated_at: now(),
    last_edited_at: now(),
  };
  await db.notes.put(next);
  await logLocalActivity(userId, "note.updated", "note", id);
  return next;
}

export async function softDeleteNote(id: string) {
  return updateNoteRow(id, { deleted_at: now() });
}
