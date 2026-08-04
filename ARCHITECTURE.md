# Toso — Application Architecture

> Personal Productivity Operating System  
> Modules: **Planner** · **Knowledge Hub**  
> Status: **Step 3 — UI design system + app shell** (awaiting approval before Step 4)

---

## 1. Product Vision

Toso is a premium personal productivity OS that unifies task management and note-taking into one cohesive experience. The product identity draws from Linear (precision), Notion (depth), Apple Calendar (clarity), Arc (spatial elegance), Raycast (keyboard-first), and Todoist (task craft).

**Non-negotiables**
- Fully functional backend (no mocks, no placeholders)
- Realtime multi-tab sync via Supabase
- Soft deletes, autosave, optimistic UI
- Deployable to Vercel with minimal env configuration

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  Next.js 15 App Router · React 19 · TypeScript · Tailwind       │
│  Zustand (UI state) · TanStack Query (server state)              │
│  TipTap · Framer Motion · Recharts · DnD Kit                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                    Next.js Edge / Node Runtime                   │
│  Server Actions · Route Handlers · Middleware (Auth + RLS gate)  │
│  Validation (Zod) · Rate Limiting · Error Boundaries             │
└──────────┬─────────────────────────────┬────────────────────────┘
           │                             │
┌──────────▼──────────┐      ┌───────────▼───────────┐
│  Supabase Auth      │      │  Supabase Postgres     │
│  JWT · Sessions     │      │  RLS · Full-text       │
│  SSR cookie bridge  │      │  Realtime publications │
└─────────────────────┘      └───────────┬────────────┘
                                         │
                             ┌───────────▼───────────┐
                             │  Supabase Storage      │
                             │  attachments bucket    │
                             │  avatars bucket        │
                             └────────────────────────┘
```

### Data Flow Patterns

| Concern | Pattern |
|---|---|
| Reads | TanStack Query → Server Action / Route Handler → Supabase (RLS) |
| Mutations | Optimistic update → Server Action → invalidate / reconcile |
| Realtime | Supabase Realtime channel → Query cache patch |
| Autosave | Debounced mutation (notes ~1.2s, settings ~800ms) |
| Offline | IndexedDB queue (pending mutations) + cache hydration |
| Search | Postgres `tsvector` + client debounce (200ms) |

---

## 3. Tech Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR auth, Server Actions, Vercel-native |
| Language | TypeScript (strict) | End-to-end type safety |
| UI | Tailwind + shadcn/ui | Consistent primitives, accessible |
| Motion | Framer Motion | Layout transitions, micro-interactions |
| Icons | Lucide | Clean, Linear-like iconography |
| Auth | Supabase Auth | Email/OAuth, SSR helpers |
| DB | Supabase Postgres | RLS, Realtime, FTS in one platform |
| Storage | Supabase Storage | Signed URLs, RLS policies |
| Client state | Zustand | Sidebar, panels, theme, command palette |
| Server state | TanStack Query v5 | Cache, optimistic updates, prefetch |
| Editor | TipTap | Notion-like blocks, slash commands |
| Charts | Recharts | Analytics module |
| DnD | @dnd-kit | Tasks, time blocks, kanban, folders |
| Validation | Zod | Shared client/server schemas |
| Dates | date-fns + date-fns-tz | Planner calendars & timezones |
| Virtualization | @tanstack/react-virtual | Long task/note lists |

**Prisma:** Not required. Supabase client + typed SQL / generated types from the schema keep the stack lean and align with Realtime + RLS. A `database.types.ts` generated from Supabase is the source of truth.

---

## 4. Feature-Based Folder Architecture (Preview for Step 2)

```
toso/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, signup, callback
│   ├── (app)/                    # Authenticated shell
│   │   ├── dashboard/
│   │   ├── planner/
│   │   │   ├── page.tsx          # Default: today / list
│   │   │   ├── calendar/
│   │   │   ├── board/
│   │   │   ├── timeline/
│   │   │   ├── habits/
│   │   │   ├── goals/
│   │   │   └── pomodoro/
│   │   ├── knowledge/
│   │   │   ├── page.tsx
│   │   │   └── [noteId]/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/                      # Route handlers (webhooks, uploads)
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── layout/                   # Sidebar, TopNav, Panels, Shell
│   ├── shared/                   # Search, CommandPalette, Skeletons
│   └── editors/                  # TipTap editor + extensions
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── planner/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── time-blocking/
│   │   ├── habits/
│   │   ├── goals/
│   │   ├── pomodoro/
│   │   └── reminders/
│   ├── knowledge/
│   │   ├── notes/
│   │   ├── folders/
│   │   ├── tags/
│   │   └── editor/
│   ├── analytics/
│   ├── search/
│   ├── settings/
│   └── notifications/
├── lib/
│   ├── supabase/                 # browser, server, middleware clients
│   ├── validators/               # Zod schemas
│   ├── errors/                   # Custom error classes
│   ├── utils/                    # cn, dates, debounce
│   └── constants/
├── services/                     # Domain service layer
├── repositories/                 # Data access (Supabase queries)
├── hooks/                        # Shared hooks
├── stores/                       # Zustand stores
├── types/
├── supabase/
│   ├── migrations/               # SQL migrations
│   └── seed.sql                  # Default folders, categories
└── public/
```

**Layering rules**
1. `components/` — presentational / reusable UI only
2. `features/*` — feature UI + feature hooks + feature actions
3. `services/` — business rules (no React imports)
4. `repositories/` — Supabase queries only (no business logic)
5. `app/` — thin route composition; no heavy logic

---

## 5. Database Schema

All tables share:

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
created_by  uuid NOT NULL REFERENCES profiles(id)  -- owner
deleted_at  timestamptz                            -- soft delete
```

`updated_at` maintained via trigger. Soft-deleted rows excluded by default in repositories (`deleted_at IS NULL`).

### 5.1 Entity Relationship Overview

```
profiles ─┬─ settings
          ├─ categories
          ├─ tags
          ├─ folders ──┐ (self-referential parent_id)
          │            └─ notes ── note_tags, note_versions, bookmarks
          ├─ tasks ────┬─ subtasks
          │            ├─ task_tags
          │            ├─ task_attachments → storage
          │            └─ reminders
          ├─ habits ─── habit_logs
          ├─ goals
          ├─ pomodoro_sessions
          ├─ activity_logs
          ├─ notifications
          └─ analytics_snapshots (optional materialization)
```

### 5.2 Core Tables

#### `profiles`
Extends `auth.users`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | = auth.users.id |
| email | text | |
| display_name | text | |
| avatar_url | text | |
| timezone | text | IANA, default UTC |
| ...base columns | | |

#### `user_settings`
| Column | Type | Notes |
|---|---|---|
| user_id | uuid UNIQUE | FK profiles |
| theme | text | `system` \| `light` \| `dark` |
| accent_color | text | default `#6366F1` |
| notifications_enabled | boolean | |
| desktop_notifications | boolean | |
| week_starts_on | smallint | 0–6 |
| pomodoro_work_min | int | default 25 |
| pomodoro_break_min | int | default 5 |
| default_planner_view | text | list/kanban/calendar/... |
| sidebar_collapsed | boolean | |
| export prefs / JSON | jsonb | extensible |

#### `categories`
| Column | Type |
|---|---|
| name | text |
| color | text |
| icon | text |
| position | int |

#### `tags`
| Column | Type |
|---|---|
| name | text |
| color | text |
| scope | text | `task` \| `note` \| `both` |

#### `folders`
| Column | Type | Notes |
|---|---|---|
| name | text | |
| parent_id | uuid NULL | self-FK → nested folders |
| color | text | |
| icon | text | |
| position | int | sibling order |
| is_favorite | boolean | |
| is_archived | boolean | |
| path | text | materialized path `/Work/AI` for fast subtree |

Default seed folders: Work, AI, Programming, Legal, Projects, Meetings, Learning, Personal, Finance, Ideas, Journal, Health, Books, Travel, Recipes.

#### `notes`
| Column | Type | Notes |
|---|---|---|
| folder_id | uuid NULL | |
| title | text | |
| content | jsonb | TipTap JSON document |
| content_text | text | plain extract for FTS |
| cover_url | text | |
| is_pinned | boolean | |
| is_favorite | boolean | |
| is_archived | boolean | |
| word_count | int | |
| character_count | int | |
| reading_time_min | int | |
| last_edited_at | timestamptz | |
| search_vector | tsvector | generated |

#### `note_versions`
| Column | Type | Notes |
|---|---|---|
| note_id | uuid | |
| content | jsonb | snapshot |
| title | text | |
| version | int | monotonic per note |

#### `note_tags`
`note_id` + `tag_id` composite PK (+ base audit via junction meta if needed).

#### `bookmarks`
| Column | Type |
|---|---|
| note_id | uuid NULL |
| url | text |
| title | text |
| description | text |
| favicon_url | text |

#### `tasks`
| Column | Type | Notes |
|---|---|---|
| title | text | |
| description | text / jsonb | rich optional |
| status | text | `todo` \| `in_progress` \| `done` \| `cancelled` |
| priority | text | `none` \| `low` \| `medium` \| `high` \| `urgent` |
| category_id | uuid NULL | |
| due_date | date NULL | |
| start_time | timestamptz NULL | time-blocking |
| end_time | timestamptz NULL | |
| estimated_minutes | int NULL | |
| actual_minutes | int NULL | |
| reminder_at | timestamptz NULL | |
| repeat_rule | text NULL | RRULE string |
| parent_recurring_id | uuid NULL | instance → series |
| color | text NULL | label |
| is_favorite | boolean | |
| is_pinned | boolean | |
| is_archived | boolean | |
| position | numeric | fractional indexing for DnD |
| completed_at | timestamptz NULL | |
| notes | text | |
| search_vector | tsvector | |

#### `subtasks`
| Column | Type |
|---|---|---|
| task_id | uuid |
| title | text |
| is_completed | boolean |
| position | numeric |

#### `task_tags`
`task_id` + `tag_id`

#### `attachments`
| Column | Type | Notes |
|---|---|---|
| entity_type | text | `task` \| `note` |
| entity_id | uuid | |
| storage_path | text | |
| file_name | text | |
| mime_type | text | |
| size_bytes | bigint | |
| checksum | text | |

#### `reminders`
| Column | Type |
|---|---|---|
| task_id | uuid NULL |
| fire_at | timestamptz |
| channel | text | `browser` \| `email` |
| status | text | `pending` \| `sent` \| `dismissed` |
| payload | jsonb | |

#### `habits`
| Column | Type |
|---|---|---|
| title | text |
| description | text |
| frequency | text | daily / weekly mask |
| target_per_period | int |
| color | text |
| is_archived | boolean |
| position | int |

#### `habit_logs`
| Column | Type |
|---|---|---|
| habit_id | uuid |
| logged_on | date |
| completed | boolean |
| value | numeric NULL | optional quantity |
| UNIQUE(habit_id, logged_on) where deleted_at IS NULL |

#### `goals`
| Column | Type |
|---|---|---|
| title | text |
| description | text |
| target_date | date |
| status | text |
| progress | numeric | 0–100 |
| linked_task_ids | uuid[] | or junction later |

#### `pomodoro_sessions`
| Column | Type |
|---|---|---|
| task_id | uuid NULL |
| started_at | timestamptz |
| ended_at | timestamptz NULL |
| duration_minutes | int |
| kind | text | `work` \| `break` |
| completed | boolean |

#### `activity_logs`
| Column | Type | Notes |
|---|---|---|
| action | text | `task.created`, `note.updated`, … |
| entity_type | text | |
| entity_id | uuid | |
| metadata | jsonb | |

#### `notifications`
| Column | Type |
|---|---|---|
| title | text |
| body | text |
| type | text |
| read_at | timestamptz NULL |
| href | text NULL |
| metadata | jsonb | |

### 5.3 Indexes & Search

- GIN on `tasks.search_vector`, `notes.search_vector`
- B-tree on `(created_by, due_date)`, `(created_by, status)`, `(folder_id, position)`
- Partial indexes where `deleted_at IS NULL`
- Unique `(created_by, lower(name))` on tags/categories

### 5.4 Row Level Security

Every user-owned table:

```sql
CREATE POLICY "owner_select" ON tasks
  FOR SELECT USING (created_by = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "owner_insert" ON tasks
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "owner_update" ON tasks
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "owner_delete" ON tasks
  FOR UPDATE USING (created_by = auth.uid()); -- soft delete via update
```

Hard delete only for purge of trash older than retention (service role / scheduled function).

Storage policies: path prefix `/{user_id}/...`.

### 5.5 Realtime

Enable Realtime on: `tasks`, `subtasks`, `notes`, `folders`, `reminders`, `notifications`, `habit_logs`, `pomodoro_sessions`.

Client filters by `created_by=eq.{uid}`.

---

## 6. Backend Architecture

### 6.1 Repository Pattern

```
features/planner/tasks/actions.ts   →  services/task.service.ts  →  repositories/task.repository.ts  →  Supabase
```

- **Repository**: CRUD, filters, pagination, FTS queries
- **Service**: validation orchestration, soft-delete cascade rules, activity logging, conflict detection (time blocks)
- **Actions / Route Handlers**: auth gate, Zod parse, map domain errors → HTTP/ActionResult

### 6.2 Action Result Contract

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; fields?: Record<string, string> } }
```

### 6.3 API Surface (Server Actions primary)

| Domain | Operations |
|---|---|
| Tasks | create, update, softDelete, restore, archive, duplicate, bulkUpdate, reorder, list (filter/sort/page), search |
| Subtasks | create, update, reorder, delete |
| Notes | create, updateContent (autosave), metadata, softDelete, restore, archive, duplicate, versions.list, versions.restore |
| Folders | create, rename, move, reorder, archive, softDelete |
| Tags / Categories | CRUD |
| Habits | CRUD + logDay |
| Goals | CRUD + progress |
| Pomodoro | start, complete, list |
| Reminders | schedule, dismiss |
| Search | globalSearch(query) |
| Analytics | getDashboardMetrics(range) |
| Settings | get, update |
| Attachments | signedUpload, confirm, delete |
| Export / Import | JSON backup export/import |

Pagination: cursor-based (`position` / `updated_at` + `id`) for lists; limit max 100.

### 6.4 Validation

Shared Zod schemas in `lib/validators/*` imported by both client forms and server actions.

### 6.5 Error Classes

```
AppError
├── ValidationError
├── UnauthorizedError
├── ForbiddenError
├── NotFoundError
├── ConflictError          // scheduling overlaps
├── RateLimitError
└── StorageError
```

---

## 7. Frontend Architecture

### 7.1 App Shell

```
┌──────── Sidebar ────────┬────────── Top Nav ──────────────────┐
│ Logo / collapse         │ Breadcrumbs · Global Search · ⌘K    │
│ Dashboard               │ Theme · Notifications · Avatar      │
│ Planner ▸               ├─────────────────────────────────────┤
│ Knowledge Hub ▸         │                                      │
│ Analytics               │         Main Content / Panels        │
│ Settings                │     (resizable via react-resizable)  │
└─────────────────────────┴──────────────────────────────────────┘
```

- Collapsible sidebar (persisted in settings + Zustand)
- Resizable panels: Planner list | detail; Knowledge folder tree | editor
- Route groups share one authenticated layout with providers

### 7.2 State Ownership

| State | Store |
|---|---|
| Auth session | Supabase SSR + React context |
| Tasks, notes, folders | TanStack Query |
| Sidebar open, panel sizes, active view, command palette | Zustand |
| Theme / accent | Zustand hydrated from `user_settings` |
| Pomodoro timer tick | Zustand (local) + session rows in DB |
| DnD transient | local component state |
| Offline queue | IndexedDB + sync worker hook |

### 7.3 Key Zustand Stores

- `uiStore` — sidebar, panels, modals, toasts queue
- `commandStore` — ⌘K open/query
- `themeStore` — theme + accent
- `plannerViewStore` — list/kanban/calendar/timeline/agenda + filters
- `pomodoroStore` — timer UI state
- `selectionStore` — multi-select for bulk edit

### 7.4 Performance Strategy

| Technique | Application |
|---|---|
| Lazy routes | `next/dynamic` for TipTap, Recharts, calendar, kanban |
| Code splitting | Feature-level chunks |
| Virtualization | Task lists, note lists, activity feed |
| Infinite scroll | Notes, activity, archived trash |
| Debounced search | 200ms global + module search |
| Optimistic mutations | Task status, reorder, note title |
| Prefetch | Hover sidebar links → `queryClient.prefetchQuery` |
| Skeletons | Route-level + section-level |
| Image opt | `next/image` + Supabase transforms |
| Memoization | Only where measured; prefer React Compiler-friendly patterns |
| Target | Sub-1s interactive after warm cache |

### 7.5 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| ⌘/Ctrl + K | Global search / command palette |
| N | New task (when not typing in editor) |
| Shift + N | New note |
| ⌘/Ctrl + Enter | Complete focused task |
| Esc | Close overlays |
| ⌘/Ctrl + \ | Toggle sidebar |
| `/` | Focus module search |

---

## 8. Module Designs

### 8.1 Dashboard

Server-prefetched aggregates + client realtime refresh:
- Greeting (timezone-aware)
- Live clock (client)
- Productivity score (formula: completed tasks + focus minutes + habit rate, normalized)
- Today's / upcoming tasks
- Today's / recent notes
- Quick-add task & note
- Weekly / monthly progress (Recharts)
- Recent activity feed

### 8.2 Planner

Views share the same `tasks` query with different projections:
- **List** — groupable by date/priority/status
- **Kanban** — columns by status; DnD updates status + position
- **Calendar** — month/week/day/agenda
- **Timeline / Time Blocking** — 6AM–11PM grid; resize updates `start_time`/`end_time`; conflict service flags overlaps
- **Weekly / Monthly planner** — denser calendar layouts
- Habits, Goals, Pomodoro, Reminders as sub-routes / drawers

Conflict detection (service): overlapping intervals for same user where status ≠ cancelled and not deleted.

### 8.3 Knowledge Hub

- Nested folder tree (materialized `path` + `parent_id`)
- TipTap editor: headings, lists, code, tables, images, videos, callouts, checklists, quotes, bookmarks, emoji, slash commands
- Autosave content JSON + derived `content_text` / counts
- Version snapshot every N saves or on explicit checkpoint
- Trash = soft delete; restore clears `deleted_at`
- Pin / favorite / archive flags

### 8.4 Analytics

Derived from tasks, pomodoro_sessions, habit_logs, activity_logs:
- Tasks completed, focus time, productivity trend
- Weekly / monthly activity heatmaps
- Most productive days
- Habit completion rates

Optional nightly snapshot table for faster dashboard (Phase 2 if needed).

### 8.5 Settings

Theme, accent, notifications, timezone, profile, export/import/backup JSON.

### 8.6 Global Search

Single RPC / SQL union over tasks, notes, folders, tags, categories, bookmarks using `tsvector` + `ILIKE` fallback for short queries. Ranked results with type badges; ⌘K navigates.

---

## 9. Authentication & Security

1. Supabase Auth (email + optional Google OAuth)
2. Next.js middleware refreshes session cookies; redirects unauthenticated users from `(app)/*`
3. Server Actions verify `auth.getUser()` before every mutation
4. RLS enforces ownership even if a bug skips app checks
5. Zod validation + sanitize TipTap HTML on render (DOMPurify for any HTML export)
6. CSRF: SameSite cookies + Next.js Server Action origin checks
7. Rate limiting: Upstash Redis or in-memory edge limiter on auth + search + upload endpoints
8. Uploads: MIME allowlist, size caps (e.g. 25MB), virus-scan optional later, path scoped to user id
9. Roles: single-user for v1 (`owner`); schema ready for `role` column later

---

## 10. Sync, Offline & Autosave

```
User edit → local optimistic cache
         → debounce → Server Action
         → success: reconcile IDs / timestamps
         → failure: rollback + toast + offline queue enqueue

Realtime event from other tab → patch TanStack Query cache (ignore self via client_mutation_id)
```

Offline:
- Persist Query cache (localStorage/IndexedDB)
- Mutation outbox with replay on `online`
- Conflict policy: last-write-wins on `updated_at` for notes; merge warning if stale

Autosave: no Save button; dirty indicator in editor chrome.

---

## 11. Notifications

1. Reminder worker: Supabase Edge Function / cron polls `reminders` where `fire_at <= now()` and `status=pending`
2. Inserts `notifications` row + Realtime push
3. Client requests `Notification` permission; shows desktop notification when tab open or via service worker (Phase 1: foreground + permission-based)

---

## 12. File Storage

Buckets:
- `attachments` — private, RLS
- `avatars` — public read, owner write

Upload flow: request signed URL → PUT → `attachments` row confirm → bind to task/note.

---

## 13. Design System (UI Architecture Preview)

Tokens (CSS variables):
- `--accent: #6366F1`
- Neutrals for light/dark surfaces
- Gradients: indigo→violet soft, cool slate glass, aurora mesh (sparingly)
- Radius: `lg` / `xl` / `2xl`
- Shadows: soft layered
- Glass: `backdrop-blur` on sidebar / command palette / floating panels
- Typography: distinctive sans for UI (e.g. Geist or similar non-default stack) + optional display for empty states

Motion language:
- Page transitions 150–220ms ease-out
- Sidebar collapse spring
- List item enter/exit
- Command palette scale+fade

Full UI design lands in **Step 3**.

---

## 14. Environment & Deployment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only: admin jobs
NEXT_PUBLIC_APP_URL=
```

Vercel project + Supabase project. Migrations applied via Supabase CLI. Seed default folders on first profile create (DB trigger).

---

## 15. Incremental Build Plan (Locked Sequence)

| Step | Deliverable | Gate |
|---|---|---|
| **1** | Architecture (this document) | Done |
| **2** | Folder structure + Next.js scaffold + tooling | Done |
| **3** | UI design system + shell (sidebar, top nav, theme) | **← YOU ARE HERE** |
| **3** | UI design system + shell (sidebar, top nav, theme) | Wait |
| **4** | Reusable components | Wait |
| **5** | Planner module (full backend + UI) | Wait |
| **6** | Knowledge Hub module | Wait |
| **7** | Supabase wiring hardening (RLS, realtime, storage) | Wait |
| **8** | Animations polish | Wait |
| **9** | Performance optimization + launch checklist | Wait |

Within each module step: schema → repository → service → actions → hooks → UI → test manually before proceeding.

---

## 16. Open Decisions (Resolved for v1)

| Decision | Resolution |
|---|---|
| Prisma vs Supabase client | Supabase client + generated types |
| REST vs Server Actions | Server Actions primary; Route Handlers for uploads/webhooks |
| Multiplayer collaboration | Out of scope v1 (personal only) |
| Mobile native apps | Responsive web only |
| Email reminders | Schema-ready; browser first |

---

## Approval Checklist

Please confirm or request changes:

- [ ] Overall system diagram & layering
- [ ] Database schema & soft-delete / RLS approach
- [ ] Feature-based folder layout
- [ ] State management split (Zustand + TanStack Query)
- [ ] Build sequence (steps 2–9)

Reply **approve** to proceed to **Step 2: Folder structure**, or list architecture revisions.
)
