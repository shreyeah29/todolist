import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
  "cancelled",
]);

export const taskPrioritySchema = z.enum([
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);

export const themeModeSchema = z.enum(["system", "light", "dark"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(500),
  description: z.string().max(10000).optional().nullable(),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("none"),
  category_id: uuidSchema.optional().nullable(),
  due_date: z.string().date().optional().nullable(),
  start_time: z.string().datetime().optional().nullable(),
  end_time: z.string().datetime().optional().nullable(),
  estimated_minutes: z.number().int().positive().optional().nullable(),
  reminder_at: z.string().datetime().optional().nullable(),
  repeat_rule: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  notes: z.string().max(20000).optional().nullable(),
  tag_ids: z.array(uuidSchema).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: uuidSchema,
  is_favorite: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  position: z.number().optional(),
  actual_minutes: z.number().int().nonnegative().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(500).default("Untitled"),
  folder_id: uuidSchema.optional().nullable(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const updateNoteSchema = z.object({
  id: uuidSchema,
  title: z.string().trim().min(1).max(500).optional(),
  folder_id: uuidSchema.optional().nullable(),
  content: z.record(z.string(), z.unknown()).optional(),
  content_text: z.string().optional(),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  cover_url: z.string().url().optional().nullable(),
});

export const createFolderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  parent_id: uuidSchema.optional().nullable(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const updateSettingsSchema = z.object({
  theme: themeModeSchema.optional(),
  accent_color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/)
    .optional(),
  notifications_enabled: z.boolean().optional(),
  desktop_notifications: z.boolean().optional(),
  timezone: z.string().min(1).optional(),
  week_starts_on: z.number().int().min(0).max(6).optional(),
  pomodoro_work_min: z.number().int().min(1).max(120).optional(),
  pomodoro_break_min: z.number().int().min(1).max(60).optional(),
  default_planner_view: z.string().optional(),
  sidebar_collapsed: z.boolean().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.number().int().min(1).max(50).default(20),
});
