/**
 * Hand-authored domain types aligned with ARCHITECTURE.md.
 * Replace/augment with `supabase gen types` once the project is linked.
 */

import type {
  Auditable,
  TaskPriority,
  TaskStatus,
  ThemeMode,
  Uuid,
} from "@/types";

export type Profile = Auditable & {
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
};

export type UserSettings = Auditable & {
  user_id: Uuid;
  theme: ThemeMode;
  accent_color: string;
  notifications_enabled: boolean;
  desktop_notifications: boolean;
  week_starts_on: number;
  pomodoro_work_min: number;
  pomodoro_break_min: number;
  default_planner_view: string;
  sidebar_collapsed: boolean;
  preferences: Record<string, unknown>;
};

export type Category = Auditable & {
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
};

export type Tag = Auditable & {
  name: string;
  color: string | null;
  scope: "task" | "note" | "both";
};

export type Folder = Auditable & {
  name: string;
  parent_id: Uuid | null;
  color: string | null;
  icon: string | null;
  position: number;
  is_favorite: boolean;
  is_archived: boolean;
  path: string;
};

export type Note = Auditable & {
  folder_id: Uuid | null;
  title: string;
  content: Record<string, unknown>;
  content_text: string;
  cover_url: string | null;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  word_count: number;
  character_count: number;
  reading_time_min: number;
  last_edited_at: string | null;
};

export type Task = Auditable & {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category_id: Uuid | null;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  reminder_at: string | null;
  repeat_rule: string | null;
  parent_recurring_id: Uuid | null;
  color: string | null;
  is_favorite: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  position: number;
  completed_at: string | null;
  notes: string | null;
};

export type Subtask = Auditable & {
  task_id: Uuid;
  title: string;
  is_completed: boolean;
  position: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<UserSettings>;
        Update: Partial<UserSettings>;
      };
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
      };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
      folders: { Row: Folder; Insert: Partial<Folder>; Update: Partial<Folder> };
      notes: { Row: Note; Insert: Partial<Note>; Update: Partial<Note> };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> };
      subtasks: {
        Row: Subtask;
        Insert: Partial<Subtask>;
        Update: Partial<Subtask>;
      };
    };
  };
};
