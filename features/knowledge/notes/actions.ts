"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { fail, ok } from "@/lib/utils/action";
import { createNoteSchema, updateNoteSchema } from "@/lib/validators";
import { requireAuthUser } from "@/repositories/task.repository";
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

function ensureConfigured() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Add env vars in Vercel and locally.",
    );
  }
}

export async function fetchFolders(): Promise<ActionResult<Folder[]>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    return ok(await listFolders(supabase, user.id));
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
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    return ok(await listNotes(supabase, user.id, input));
  } catch (error) {
    return fail(error);
  }
}

export async function fetchNote(id: string): Promise<ActionResult<Note>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    return ok(await getNote(supabase, user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export async function createNote(
  input: unknown,
): Promise<ActionResult<Note>> {
  try {
    ensureConfigured();
    const parsed = createNoteSchema.parse(input);
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    return ok(
      await insertNote(supabase, user.id, {
        title: parsed.title,
        folder_id: parsed.folder_id,
      }),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function updateNote(
  input: unknown,
): Promise<ActionResult<Note>> {
  try {
    ensureConfigured();
    const parsed = updateNoteSchema.parse(input);
    const { id, ...rest } = parsed;
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);

    const patch: Partial<Note> = { ...rest };
    if (typeof rest.content_text === "string") {
      Object.assign(patch, deriveTextStats(rest.content_text));
    }

    return ok(await updateNoteRow(supabase, user.id, id, patch));
  } catch (error) {
    return fail(error);
  }
}

export async function deleteNote(id: string): Promise<ActionResult<Note>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    return ok(await softDeleteNote(supabase, user.id, id));
  } catch (error) {
    return fail(error);
  }
}
