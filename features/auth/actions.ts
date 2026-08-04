import { db, ensureLocalWorkspace, now } from "@/lib/db/local";
import { fail, ok } from "@/lib/utils/action";
import type { ActionResult } from "@/types";
import type { Profile } from "@/types/database";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  email: z.string().email().optional(),
});

export async function bootstrapLocalSession(): Promise<
  ActionResult<Profile>
> {
  try {
    return ok(await ensureLocalWorkspace());
  } catch (error) {
    return fail(error);
  }
}

export async function updateLocalProfile(input: {
  displayName: string;
  email?: string;
}): Promise<ActionResult<Profile>> {
  try {
    const parsed = profileSchema.parse(input);
    const profile = await ensureLocalWorkspace();
    const next: Profile = {
      ...profile,
      display_name: parsed.displayName,
      email: parsed.email ?? profile.email,
      updated_at: now(),
    };
    await db.profiles.put(next);
    return ok(next);
  } catch (error) {
    return fail(error);
  }
}

export async function getLocalProfile(): Promise<ActionResult<Profile>> {
  try {
    return ok(await ensureLocalWorkspace());
  } catch (error) {
    return fail(error);
  }
}

export async function resetLocalWorkspace(): Promise<ActionResult<true>> {
  try {
    await db.delete();
    localStorage.removeItem("toso-local-user-id");
    await db.open();
    await ensureLocalWorkspace();
    return ok(true);
  } catch (error) {
    return fail(error);
  }
}
