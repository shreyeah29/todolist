import {
  createTaskRecord,
  db,
  getLocalUserId,
  logLocalActivity,
  now,
} from "@/lib/db/local";
import { NotFoundError } from "@/lib/errors";
import type { TaskPriority, TaskStatus } from "@/types";
import type { Task } from "@/types/database";

export type TaskFilters = {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  includeArchived?: boolean;
  limit?: number;
};

export async function listTasks(filters: TaskFilters = {}) {
  const userId = await getLocalUserId();
  let rows = await db.tasks
    .where("created_by")
    .equals(userId)
    .filter((task) => task.deleted_at === null)
    .toArray();

  if (!filters.includeArchived) {
    rows = rows.filter((task) => !task.is_archived);
  }
  if (filters.status?.length) {
    rows = rows.filter((task) => filters.status!.includes(task.status));
  }
  if (filters.priority?.length) {
    rows = rows.filter((task) => filters.priority!.includes(task.priority));
  }
  if (filters.dueAfter) {
    rows = rows.filter(
      (task) => task.due_date && task.due_date >= filters.dueAfter!,
    );
  }
  if (filters.dueBefore) {
    rows = rows.filter(
      (task) => task.due_date && task.due_date <= filters.dueBefore!,
    );
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    if (a.position !== b.position) return a.position - b.position;
    return b.created_at.localeCompare(a.created_at);
  });

  return rows.slice(0, filters.limit ?? 100);
}

export async function getTask(id: string) {
  const userId = await getLocalUserId();
  const task = await db.tasks.get(id);
  if (!task || task.created_by !== userId || task.deleted_at) {
    throw new NotFoundError("Task not found");
  }
  return task;
}

export async function insertTask(
  payload: Parameters<typeof createTaskRecord>[1],
) {
  const userId = await getLocalUserId();
  const task = createTaskRecord(userId, payload);
  await db.tasks.add(task);
  await logLocalActivity(userId, "task.created", "task", task.id);
  return task;
}

export async function updateTaskRow(id: string, payload: Partial<Task>) {
  const userId = await getLocalUserId();
  const current = await getTask(id);
  const next: Task = {
    ...current,
    ...payload,
    id: current.id,
    created_by: current.created_by,
    created_at: current.created_at,
    updated_at: now(),
  };
  await db.tasks.put(next);
  await logLocalActivity(userId, "task.updated", "task", id, payload);
  return next;
}

export async function softDeleteTask(id: string) {
  return updateTaskRow(id, { deleted_at: now() });
}

export async function restoreTask(id: string) {
  const userId = await getLocalUserId();
  const task = await db.tasks.get(id);
  if (!task || task.created_by !== userId) {
    throw new NotFoundError("Task not found");
  }
  const next = { ...task, deleted_at: null, updated_at: now() };
  await db.tasks.put(next);
  await logLocalActivity(userId, "task.restored", "task", id);
  return next;
}
