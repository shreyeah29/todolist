"use server";

import { ConflictError, ValidationError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { fail, ok } from "@/lib/utils/action";
import {
  createTaskSchema,
  updateTaskSchema,
} from "@/lib/validators";
import {
  getTask,
  insertTask,
  listTasks,
  logActivity,
  requireAuthUser,
  restoreTask,
  softDeleteTask,
  updateTaskRow,
  type TaskFilters,
} from "@/repositories/task.repository";
import type { ActionResult } from "@/types";
import type { Task } from "@/types/database";

function ensureConfigured() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Add env vars in Vercel and locally.",
    );
  }
}

function intervalsOverlap(
  aStart: string | null,
  aEnd: string | null,
  bStart: string | null,
  bEnd: string | null,
) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
}

export async function fetchTasks(
  filters: TaskFilters = {},
): Promise<ActionResult<Task[]>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    const tasks = await listTasks(supabase, user.id, filters);
    return ok(tasks);
  } catch (error) {
    return fail(error);
  }
}

export async function createTask(
  input: unknown,
): Promise<ActionResult<Task>> {
  try {
    ensureConfigured();
    const parsed = createTaskSchema.parse(input);
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);

    if (parsed.start_time && parsed.end_time) {
      const existing = await listTasks(supabase, user.id, {
        status: ["todo", "in_progress"],
      });
      const conflict = existing.find((task) =>
        intervalsOverlap(
          parsed.start_time ?? null,
          parsed.end_time ?? null,
          task.start_time,
          task.end_time,
        ),
      );
      if (conflict) {
        throw new ConflictError(
          `Scheduling conflict with “${conflict.title}”`,
        );
      }
    }

    const task = await insertTask(supabase, user.id, parsed);
    await logActivity(supabase, user.id, "task.created", "task", task.id);
    return ok(task);
  } catch (error) {
    return fail(error);
  }
}

export async function updateTask(
  input: unknown,
): Promise<ActionResult<Task>> {
  try {
    ensureConfigured();
    const parsed = updateTaskSchema.parse(input);
    const { id, ...rest } = parsed;
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);

    if (rest.status === "done" && !rest.completed_at) {
      rest.completed_at = new Date().toISOString();
    }
    if (rest.status && rest.status !== "done") {
      rest.completed_at = null;
    }

    const task = await updateTaskRow(supabase, user.id, id, rest);
    await logActivity(supabase, user.id, "task.updated", "task", task.id, rest);
    return ok(task);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTask(id: string): Promise<ActionResult<Task>> {
  try {
    ensureConfigured();
    if (!id) throw new ValidationError("Task id is required");
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    const task = await softDeleteTask(supabase, user.id, id);
    await logActivity(supabase, user.id, "task.deleted", "task", task.id);
    return ok(task);
  } catch (error) {
    return fail(error);
  }
}

export async function undoDeleteTask(id: string): Promise<ActionResult<Task>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    const task = await restoreTask(supabase, user.id, id);
    await logActivity(supabase, user.id, "task.restored", "task", task.id);
    return ok(task);
  } catch (error) {
    return fail(error);
  }
}

export async function toggleTaskComplete(
  id: string,
): Promise<ActionResult<Task>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    const current = await getTask(supabase, user.id, id);
    const nextStatus = current.status === "done" ? "todo" : "done";
    const task = await updateTaskRow(supabase, user.id, id, {
      status: nextStatus,
      completed_at:
        nextStatus === "done" ? new Date().toISOString() : null,
    });
    return ok(task);
  } catch (error) {
    return fail(error);
  }
}

export async function duplicateTask(id: string): Promise<ActionResult<Task>> {
  try {
    ensureConfigured();
    const supabase = await createClient();
    const user = await requireAuthUser(supabase);
    const current = await getTask(supabase, user.id, id);
    const task = await insertTask(supabase, user.id, {
      ...current,
      title: `${current.title} (copy)`,
      status: "todo",
      completed_at: null,
      position: Date.now(),
    });
    return ok(task);
  } catch (error) {
    return fail(error);
  }
}
