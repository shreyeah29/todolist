import { db, getLocalUserId } from "@/lib/db/local";
import { fail, ok } from "@/lib/utils/action";
import { searchQuerySchema } from "@/lib/validators";
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
    const parsed = searchQuerySchema.parse({ q: query });
    const userId = await getLocalUserId();
    const q = parsed.q.toLowerCase();

    const [tasks, notes, folders, tags] = await Promise.all([
      db.tasks
        .where("created_by")
        .equals(userId)
        .filter(
          (row) =>
            row.deleted_at === null && row.title.toLowerCase().includes(q),
        )
        .limit(8)
        .toArray(),
      db.notes
        .where("created_by")
        .equals(userId)
        .filter(
          (row) =>
            row.deleted_at === null &&
            (row.title.toLowerCase().includes(q) ||
              row.content_text.toLowerCase().includes(q)),
        )
        .limit(8)
        .toArray(),
      db.folders
        .where("created_by")
        .equals(userId)
        .filter(
          (row) =>
            row.deleted_at === null && row.name.toLowerCase().includes(q),
        )
        .limit(8)
        .toArray(),
      db.tags
        .where("created_by")
        .equals(userId)
        .filter(
          (row) =>
            row.deleted_at === null && row.name.toLowerCase().includes(q),
        )
        .limit(8)
        .toArray(),
    ]);

    const hits: SearchHit[] = [
      ...tasks.map((row) => ({
        entity_type: "task",
        entity_id: row.id,
        title: row.title,
        subtitle: row.status,
        rank: 1,
      })),
      ...notes.map((row) => ({
        entity_type: "note",
        entity_id: row.id,
        title: row.title,
        subtitle: row.content_text.slice(0, 80) || null,
        rank: 0.9,
      })),
      ...folders.map((row) => ({
        entity_type: "folder",
        entity_id: row.id,
        title: row.name,
        subtitle: row.path,
        rank: 0.6,
      })),
      ...tags.map((row) => ({
        entity_type: "tag",
        entity_id: row.id,
        title: row.name,
        subtitle: row.scope,
        rank: 0.4,
      })),
    ];

    return ok(hits.slice(0, parsed.limit));
  } catch (error) {
    return fail(error);
  }
}
