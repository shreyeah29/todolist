import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from "lucide-react";

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

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: "exact" | "prefix";
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: "exact",
  },
  {
    href: "/planner",
    label: "Planner",
    icon: CalendarDays,
    match: "prefix",
  },
  {
    href: "/knowledge",
    label: "Knowledge Hub",
    icon: BookOpen,
    match: "prefix",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    match: "exact",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: "exact",
  },
];

export const PLANNER_SUBNAV = [
  { href: "/planner", label: "Tasks" },
  { href: "/planner/calendar", label: "Calendar" },
  { href: "/planner/board", label: "Board" },
  { href: "/planner/timeline", label: "Timeline" },
  { href: "/planner/habits", label: "Habits" },
  { href: "/planner/goals", label: "Goals" },
  { href: "/planner/pomodoro", label: "Pomodoro" },
] as const;

export const SIDEBAR_WIDTH = 272;
export const SIDEBAR_COLLAPSED_WIDTH = 76;
