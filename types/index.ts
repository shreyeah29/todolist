export type Uuid = string;

export type SoftDeletable = {
  deleted_at: string | null;
};

export type Auditable = {
  id: Uuid;
  created_at: string;
  updated_at: string;
  created_by: Uuid;
} & SoftDeletable;

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export type ThemeMode = "system" | "light" | "dark";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export type PlannerView =
  | "list"
  | "kanban"
  | "calendar"
  | "timeline"
  | "agenda";

export type PaginationParams = {
  cursor?: string;
  limit?: number;
};

export type SortParams = {
  sortBy?: string;
  sortDir?: "asc" | "desc";
};
