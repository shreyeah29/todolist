export const APP_NAME = "Toso";
export const APP_DESCRIPTION =
  "Personal productivity operating system for tasks and notes.";

export const DEFAULT_ACCENT = "#6366F1";

export const DEFAULT_FOLDERS = [
  "Work",
  "AI",
  "Programming",
  "Legal",
  "Projects",
  "Meetings",
  "Learning",
  "Personal",
  "Finance",
  "Ideas",
  "Journal",
  "Health",
  "Books",
  "Travel",
  "Recipes",
] as const;

export const QUERY_LIMITS = {
  default: 25,
  max: 100,
} as const;

export const AUTOSAVE_MS = {
  notes: 1200,
  settings: 800,
  search: 200,
} as const;

export const STORAGE_BUCKETS = {
  attachments: "attachments",
  avatars: "avatars",
} as const;

export const UPLOAD_LIMITS = {
  maxBytes: 25 * 1024 * 1024,
  allowedMimePrefixes: [
    "image/",
    "application/pdf",
    "text/",
    "video/",
    "application/msword",
    "application/vnd.openxmlformats-officedocument",
  ],
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/planner", label: "Planner", icon: "CalendarDays" },
  { href: "/knowledge", label: "Knowledge Hub", icon: "BookOpen" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;
