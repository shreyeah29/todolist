import { ConflictError, ValidationError } from "@/lib/errors";
import { fail, ok } from "@/lib/utils/action";
import { createTaskSchema, updateTaskSchema } from "@/lib/validators";
import {
  getTask,
  insertTask,
  listTasks,
  restoreTask,
  softDeleteTask,
  updateTaskRow,
  type TaskFilters,
} from "@/repositories/task.repository";
import type { ActionResult } from "@/types";
import type { Task } from "@/types/database";

function intervalsOverlap(
  aStart: string | null | undefined,
  aEnd: string | null | undefined,
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
    return ok(await listTasks(filters));
  } catch (error) {
    return fail(error);
  }
}

export async function createTask(input: unknown): Promise<ActionResult<Task>> {
  try {
    const parsed = createTaskSchema.parse(input);

    if (parsed.start_time && parsed.end_time) {
      const existing = await listTasks({ status: ["todo", "in_progress"] });
      const conflict = existing.find((task) =>
        intervalsOverlap(
          parsed.start_time,
          parsed.end_time,
          task.start_time,
          task.end_time,
        ),
      );
      if (conflict) {
        throw new ConflictError(`Scheduling conflict with “${conflict.title}”`);
      }
    }

    return ok(await insertTask(parsed));
  } catch (error) {
    return fail(error);
  }
}

export async function updateTask(input: unknown): Promise<ActionResult<Task>> {
  try {
    const parsed = updateTaskSchema.parse(input);
    const { id, ...rest } = parsed;

    if (rest.status === "done" && !rest.completed_at) {
      rest.completed_at = new Date().toISOString();
    }
    if (rest.status && rest.status !== "done") {
      rest.completed_at = null;
    }

    return ok(await updateTaskRow(id, rest));
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTask(id: string): Promise<ActionResult<Task>> {
  try {
    if (!id) throw new ValidationError("Task id is required");
    return ok(await softDeleteTask(id));
  } catch (error) {
    return fail(error);
  }
}

export async function undoDeleteTask(id: string): Promise<ActionResult<Task>> {
  try {
    return ok(await restoreTask(id));
  } catch (error) {
    return fail(error);
  }
}

export async function toggleTaskComplete(
  id: string,
): Promise<ActionResult<Task>> {
  try {
    const current = await getTask(id);
    const nextStatus = current.status === "done" ? "todo" : "done";
    return ok(
      await updateTaskRow(id, {
        status: nextStatus,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
      }),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function duplicateTask(id: string): Promise<ActionResult<Task>> {
  try {
    const current = await getTask(id);
    return ok(
      await insertTask({
        title: `${current.title} (copy)`,
        description: current.description,
        status: "todo",
        priority: current.priority,
        category_id: current.category_id,
        due_date: current.due_date,
        start_time: null,
        end_time: null,
        estimated_minutes: current.estimated_minutes,
        color: current.color,
        notes: current.notes,
        position: Date.now(),
      }),
    );
  } catch (error) {
    return fail(error);
  }
}
