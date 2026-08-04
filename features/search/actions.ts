"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { fail, ok } from "@/lib/utils/action";
import { searchQuerySchema } from "@/lib/validators";
import { requireAuthUser } from "@/repositories/task.repository";
import type { ActionResult } from "@/types";

export type SearchHit = {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string | null;
  rank: number;
};

export async function globalSearch(
  query: string,
): Promise<ActionResult<SearchHit[]>> {
  try {
    if (!hasSupabaseEnv()) {
      throw new Error("Supabase is not configured");
    }
    const parsed = searchQuerySchema.parse({ q: query });
    const supabase = await createClient();
    await requireAuthUser(supabase);

    const { data, error } = await supabase.rpc("global_search", {
      search_query: parsed.q,
      result_limit: parsed.limit,
    });

    if (error) {
      // Fallback ILIKE search if RPC is unavailable
      const [tasks, notes, folders, tags] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, status")
          .is("deleted_at", null)
          .ilike("title", `%${parsed.q}%`)
          .limit(8),
        supabase
          .from("notes")
          .select("id, title, content_text")
          .is("deleted_at", null)
          .ilike("title", `%${parsed.q}%`)
          .limit(8),
        supabase
          .from("folders")
          .select("id, name, path")
          .is("deleted_at", null)
          .ilike("name", `%${parsed.q}%`)
          .limit(8),
        supabase
          .from("tags")
          .select("id, name, scope")
          .is("deleted_at", null)
          .ilike("name", `%${parsed.q}%`)
          .limit(8),
      ]);

      const hits: SearchHit[] = [
        ...(tasks.data ?? []).map((row) => ({
          entity_type: "task",
          entity_id: row.id,
          title: row.title,
          subtitle: row.status,
          rank: 0.5,
        })),
        ...(notes.data ?? []).map((row) => ({
          entity_type: "note",
          entity_id: row.id,
          title: row.title,
          subtitle: row.content_text?.slice(0, 80) ?? null,
          rank: 0.5,
        })),
        ...(folders.data ?? []).map((row) => ({
          entity_type: "folder",
          entity_id: row.id,
          title: row.name,
          subtitle: row.path,
          rank: 0.4,
        })),
        ...(tags.data ?? []).map((row) => ({
          entity_type: "tag",
          entity_id: row.id,
          title: row.name,
          subtitle: row.scope,
          rank: 0.3,
        })),
      ];

      return ok(hits);
    }

    return ok((data ?? []) as SearchHit[]);
  } catch (error) {
    return fail(error);
  }
}
