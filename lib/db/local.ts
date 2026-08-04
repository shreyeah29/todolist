import Dexie, { type EntityTable } from "dexie";

import { DEFAULT_FOLDERS } from "@/lib/constants";
import type {
  Folder,
  Note,
  Profile,
  Task,
  UserSettings,
} from "@/types/database";
import type { TaskPriority, TaskStatus } from "@/types";

export type LocalActivity = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string | null;
};

export type LocalTag = {
  id: string;
  name: string;
  color: string | null;
  scope: "task" | "note" | "both";
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string | null;
};

const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

export class TosoDatabase extends Dexie {
  profiles!: EntityTable<Profile, "id">;
  settings!: EntityTable<UserSettings, "id">;
  folders!: EntityTable<Folder, "id">;
  tasks!: EntityTable<Task, "id">;
  notes!: EntityTable<Note, "id">;
  tags!: EntityTable<LocalTag, "id">;
  activity!: EntityTable<LocalActivity, "id">;

  constructor() {
    super("toso_local_v1");

    this.version(1).stores({
      profiles: "id, email, deleted_at",
      settings: "id, user_id",
      folders: "id, created_by, parent_id, position, deleted_at",
      tasks:
        "id, created_by, status, priority, due_date, position, deleted_at, is_archived, updated_at",
      notes:
        "id, created_by, folder_id, updated_at, deleted_at, is_archived, is_pinned",
      tags: "id, created_by, name, deleted_at",
      activity: "id, created_by, created_at, entity_type",
    });
  }
}

export const db = new TosoDatabase();

export const LOCAL_USER_ID_KEY = "toso-local-user-id";

export async function ensureLocalWorkspace() {
  if (typeof window === "undefined") {
    throw new Error("Local database is only available in the browser");
  }

  let userId = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!userId) {
    userId = id();
    localStorage.setItem(LOCAL_USER_ID_KEY, userId);
  }

  const existing = await db.profiles.get(userId);
  if (existing && !existing.deleted_at) {
    return existing;
  }

  const timestamp = now();
  const profile: Profile = {
    id: userId,
    email: "local@toso.app",
    display_name: "Local User",
    avatar_url: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    created_at: timestamp,
    updated_at: timestamp,
    created_by: userId,
    deleted_at: null,
  };

  const settings: UserSettings = {
    id: id(),
    user_id: userId,
    theme: "system",
    accent_color: "#6366F1",
    notifications_enabled: true,
    desktop_notifications: false,
    week_starts_on: 1,
    pomodoro_work_min: 25,
    pomodoro_break_min: 5,
    default_planner_view: "list",
    sidebar_collapsed: false,
    preferences: {},
    created_at: timestamp,
    updated_at: timestamp,
    created_by: userId,
    deleted_at: null,
  };

  const folders: Folder[] = DEFAULT_FOLDERS.map((name, index) => ({
    id: id(),
    name,
    parent_id: null,
    color: null,
    icon: null,
    position: index + 1,
    is_favorite: false,
    is_archived: false,
    path: `/${name}`,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: userId!,
    deleted_at: null,
  }));

  await db.transaction("rw", db.profiles, db.settings, db.folders, async () => {
    await db.profiles.put(profile);
    await db.settings.put(settings);
    await db.folders.bulkPut(folders);
  });

  return profile;
}

export async function getLocalUserId() {
  const profile = await ensureLocalWorkspace();
  return profile.id;
}

export function createTaskRecord(
  userId: string,
  input: {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    estimated_minutes?: number | null;
    reminder_at?: string | null;
    repeat_rule?: string | null;
    color?: string | null;
    notes?: string | null;
    category_id?: string | null;
    position?: number;
  },
): Task {
  const timestamp = now();
  return {
    id: id(),
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? "todo",
    priority: input.priority ?? "none",
    category_id: input.category_id ?? null,
    due_date: input.due_date ?? null,
    start_time: input.start_time ?? null,
    end_time: input.end_time ?? null,
    estimated_minutes: input.estimated_minutes ?? null,
    actual_minutes: null,
    reminder_at: input.reminder_at ?? null,
    repeat_rule: input.repeat_rule ?? null,
    parent_recurring_id: null,
    color: input.color ?? null,
    is_favorite: false,
    is_pinned: false,
    is_archived: false,
    position: input.position ?? Date.now(),
    completed_at: null,
    notes: input.notes ?? null,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: userId,
    deleted_at: null,
  };
}

export function createNoteRecord(
  userId: string,
  input: { title?: string; folder_id?: string | null },
): Note {
  const timestamp = now();
  return {
    id: id(),
    folder_id: input.folder_id ?? null,
    title: input.title?.trim() || "Untitled",
    content: EMPTY_DOC,
    content_text: "",
    cover_url: null,
    is_pinned: false,
    is_favorite: false,
    is_archived: false,
    word_count: 0,
    character_count: 0,
    reading_time_min: 0,
    last_edited_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: userId,
    deleted_at: null,
  };
}

export async function logLocalActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  const timestamp = now();
  await db.activity.add({
    id: id(),
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: userId,
    deleted_at: null,
  });
}

export { EMPTY_DOC, now, id as createId };
