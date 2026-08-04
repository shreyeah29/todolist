import type { SupabaseClient } from "@supabase/supabase-js";

import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { Task } from "@/types/database";
import type { TaskPriority, TaskStatus } from "@/types";

export type TaskFilters = {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  includeArchived?: boolean;
  limit?: number;
};

export async function requireAuthUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new UnauthorizedError();
  return user;
}

export async function listTasks(
  supabase: SupabaseClient,
  userId: string,
  filters: TaskFilters = {},
) {
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("created_by", userId)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (!filters.includeArchived) {
    query = query.eq("is_archived", false);
  }
  if (filters.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters.priority?.length) {
    query = query.in("priority", filters.priority);
  }
  if (filters.dueAfter) {
    query = query.gte("due_date", filters.dueAfter);
  }
  if (filters.dueBefore) {
    query = query.lte("due_date", filters.dueBefore);
  }
  if (filters.search?.trim()) {
    query = query.or(
      `title.ilike.%${filters.search.trim()}%,description.ilike.%${filters.search.trim()}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function getTask(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("created_by", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Task not found");
  return data as Task;
}

export async function insertTask(
  supabase: SupabaseClient,
  userId: string,
  payload: Partial<Task>,
) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? "todo",
      priority: payload.priority ?? "none",
      category_id: payload.category_id ?? null,
      due_date: payload.due_date ?? null,
      start_time: payload.start_time ?? null,
      end_time: payload.end_time ?? null,
      estimated_minutes: payload.estimated_minutes ?? null,
      reminder_at: payload.reminder_at ?? null,
      repeat_rule: payload.repeat_rule ?? null,
      color: payload.color ?? null,
      notes: payload.notes ?? null,
      position: payload.position ?? Date.now(),
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTaskRow(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  payload: Partial<Task>,
) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", userId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function softDeleteTask(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function restoreTask(
  supabase: SupabaseClient,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("activity_logs").insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_by: userId,
  });
}
