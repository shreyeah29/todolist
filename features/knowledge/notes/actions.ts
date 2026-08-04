import { fail, ok } from "@/lib/utils/action";
import { createNoteSchema, updateNoteSchema } from "@/lib/validators";
import {
  deriveTextStats,
  getNote,
  insertNote,
  listFolders,
  listNotes,
  softDeleteNote,
  updateNoteRow,
} from "@/repositories/note.repository";
import type { ActionResult } from "@/types";
import type { Folder, Note } from "@/types/database";

export async function fetchFolders(): Promise<ActionResult<Folder[]>> {
  try {
    return ok(await listFolders());
  } catch (error) {
    return fail(error);
  }
}

export async function fetchNotes(input?: {
  folderId?: string | null;
  search?: string;
  limit?: number;
}): Promise<ActionResult<Note[]>> {
  try {
    return ok(await listNotes(input));
  } catch (error) {
    return fail(error);
  }
}

export async function fetchNote(id: string): Promise<ActionResult<Note>> {
  try {
    return ok(await getNote(id));
  } catch (error) {
    return fail(error);
  }
}

export async function createNote(input: unknown): Promise<ActionResult<Note>> {
  try {
    const parsed = createNoteSchema.parse(input);
    return ok(
      await insertNote({
        title: parsed.title,
        folder_id: parsed.folder_id,
      }),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function updateNote(input: unknown): Promise<ActionResult<Note>> {
  try {
    const parsed = updateNoteSchema.parse(input);
    const { id, ...rest } = parsed;
    const patch: Partial<Note> = { ...rest };
    if (typeof rest.content_text === "string") {
      Object.assign(patch, deriveTextStats(rest.content_text));
    }
    return ok(await updateNoteRow(id, patch));
  } catch (error) {
    return fail(error);
  }
}

export async function deleteNote(id: string): Promise<ActionResult<Note>> {
  try {
    return ok(await softDeleteNote(id));
  } catch (error) {
    return fail(error);
  }
}
