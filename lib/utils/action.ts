import type { ActionResult } from "@/types";
import { toActionError } from "@/lib/errors";

export async function requireUserId(
  getUser: () => Promise<{ id: string } | null>,
): Promise<string> {
  const user = await getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user.id;
}

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(error: unknown): ActionResult<never> {
  return { success: false, error: toActionError(error) };
}

export async function withActionResult<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    return fail(error);
  }
}
