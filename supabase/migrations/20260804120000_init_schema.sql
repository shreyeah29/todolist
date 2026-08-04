-- Toso production schema
-- Apply via: supabase db push  OR run in Supabase SQL editor

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  deleted_at timestamptz
);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  accent_color text not null default '#6366F1',
  notifications_enabled boolean not null default true,
  desktop_notifications boolean not null default false,
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  pomodoro_work_min int not null default 25,
  pomodoro_break_min int not null default 5,
  default_planner_view text not null default 'list',
  sidebar_collapsed boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  deleted_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  icon text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  scope text not null default 'both' check (scope in ('task', 'note', 'both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.folders (id) on delete set null,
  color text,
  icon text,
  position int not null default 0,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  path text not null default '/',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  category_id uuid references public.categories (id) on delete set null,
  due_date date,
  start_time timestamptz,
  end_time timestamptz,
  estimated_minutes int,
  actual_minutes int,
  reminder_at timestamptz,
  repeat_rule text,
  parent_recurring_id uuid references public.tasks (id) on delete set null,
  color text,
  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  position numeric not null default 0,
  completed_at timestamptz,
  notes text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.task_tags (
  task_id uuid not null references public.tasks (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders (id) on delete set null,
  title text not null default 'Untitled',
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  content_text text not null default '',
  cover_url text,
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  word_count int not null default 0,
  character_count int not null default 0,
  reading_time_min int not null default 0,
  last_edited_at timestamptz,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  content jsonb not null,
  title text not null,
  version int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz,
  unique (note_id, version)
);

create table if not exists public.note_tags (
  note_id uuid not null references public.notes (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, tag_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references public.notes (id) on delete set null,
  url text not null,
  title text,
  description text,
  favicon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('task', 'note')),
  entity_id uuid not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete cascade,
  fire_at timestamptz not null,
  channel text not null default 'browser' check (channel in ('browser', 'email')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'dismissed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  frequency text not null default 'daily',
  target_per_period int not null default 1,
  color text,
  is_archived boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  logged_on date not null,
  completed boolean not null default true,
  value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create unique index if not exists habit_logs_unique_day
  on public.habit_logs (habit_id, logged_on)
  where deleted_at is null;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  target_date date,
  status text not null default 'active',
  progress numeric not null default 0,
  linked_task_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int not null default 25,
  kind text not null default 'work' check (kind in ('work', 'break')),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  type text not null default 'info',
  read_at timestamptz,
  href text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz
);

-- profile bootstrap
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  folder_name text;
  default_folders text[] := array[
    'Work','AI','Programming','Legal','Projects','Meetings','Learning',
    'Personal','Finance','Ideas','Journal','Health','Books','Travel','Recipes'
  ];
begin
  insert into public.profiles (id, email, display_name, timezone, created_by)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC'),
    new.id
  )
  on conflict (id) do nothing;

  insert into public.user_settings (id, user_id, created_by)
  values (gen_random_uuid(), new.id, new.id)
  on conflict (user_id) do nothing;

  foreach folder_name in array default_folders loop
    insert into public.folders (id, name, path, position, created_by)
    values (
      gen_random_uuid(),
      folder_name,
      '/' || folder_name,
      array_position(default_folders, folder_name),
      new.id
    );
  end loop;

  return new;
end;
$$;


-- search vectors
create or replace function public.tasks_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.notes, '')), 'C');
  return new;
end;
$$;

create or replace function public.notes_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.content_text, '')), 'B');
  return new;
end;
$$;

drop trigger if exists tasks_search_vector on public.tasks;
create trigger tasks_search_vector
before insert or update of title, description, notes on public.tasks
for each row execute function public.tasks_search_vector_update();

drop trigger if exists notes_search_vector on public.notes;
create trigger notes_search_vector
before insert or update of title, content_text on public.notes
for each row execute function public.notes_search_vector_update();

-- updated_at triggers
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','user_settings','categories','tags','folders','tasks','subtasks',
    'notes','note_versions','bookmarks','attachments','reminders','habits',
    'habit_logs','goals','pomodoro_sessions','activity_logs','notifications'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

-- indexes
create index if not exists tasks_owner_due_idx on public.tasks (created_by, due_date) where deleted_at is null;
create index if not exists tasks_owner_status_idx on public.tasks (created_by, status) where deleted_at is null;
create index if not exists tasks_search_idx on public.tasks using gin (search_vector);
create index if not exists notes_owner_folder_idx on public.notes (created_by, folder_id) where deleted_at is null;
create index if not exists notes_search_idx on public.notes using gin (search_vector);
create index if not exists folders_owner_parent_idx on public.folders (created_by, parent_id) where deleted_at is null;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.folders enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.task_tags enable row level security;
alter table public.notes enable row level security;
alter table public.note_versions enable row level security;
alter table public.note_tags enable row level security;
alter table public.bookmarks enable row level security;
alter table public.attachments enable row level security;
alter table public.reminders enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.goals enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- owner policies helper pattern
create or replace function public.is_owner(owner uuid)
returns boolean
language sql
stable
as $$
  select owner = auth.uid();
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'categories','tags','folders','tasks','subtasks','notes','note_versions',
    'bookmarks','attachments','reminders','habits','habit_logs','goals',
    'pomodoro_sessions','activity_logs','notifications','user_settings'
  ]
  loop
    execute format('drop policy if exists %I_select on public.%I', tbl || '_owner', tbl);
    execute format('drop policy if exists %I_insert on public.%I', tbl || '_owner', tbl);
    execute format('drop policy if exists %I_update on public.%I', tbl || '_owner', tbl);
    execute format('drop policy if exists %I_delete on public.%I', tbl || '_owner', tbl);

    execute format(
      'create policy %I on public.%I for select using (created_by = auth.uid())',
      tbl || '_owner_select', tbl
    );
    execute format(
      'create policy %I on public.%I for insert with check (created_by = auth.uid())',
      tbl || '_owner_insert', tbl
    );
    execute format(
      'create policy %I on public.%I for update using (created_by = auth.uid())',
      tbl || '_owner_update', tbl
    );
    execute format(
      'create policy %I on public.%I for delete using (created_by = auth.uid())',
      tbl || '_owner_delete', tbl
    );
  end loop;
end $$;

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_select on public.profiles for select using (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid());

drop policy if exists task_tags_select on public.task_tags;
drop policy if exists task_tags_insert on public.task_tags;
drop policy if exists task_tags_delete on public.task_tags;
create policy task_tags_select on public.task_tags for select using (
  exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid())
);
create policy task_tags_insert on public.task_tags for insert with check (
  exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid())
);
create policy task_tags_delete on public.task_tags for delete using (
  exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid())
);

drop policy if exists note_tags_select on public.note_tags;
drop policy if exists note_tags_insert on public.note_tags;
drop policy if exists note_tags_delete on public.note_tags;
create policy note_tags_select on public.note_tags for select using (
  exists (select 1 from public.notes n where n.id = note_id and n.created_by = auth.uid())
);
create policy note_tags_insert on public.note_tags for insert with check (
  exists (select 1 from public.notes n where n.id = note_id and n.created_by = auth.uid())
);
create policy note_tags_delete on public.note_tags for delete using (
  exists (select 1 from public.notes n where n.id = note_id and n.created_by = auth.uid())
);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- storage buckets
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists attachments_owner_rw on storage.objects;
create policy attachments_owner_rw on storage.objects
for all using (
  bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
for select using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write on storage.objects
for all using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- global search RPC
create or replace function public.global_search(search_query text, result_limit int default 20)
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  rank real
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  (
    select 'task'::text, t.id, t.title, coalesce(t.status, ''), ts_rank(t.search_vector, websearch_to_tsquery('english', search_query))
    from public.tasks t
    where t.created_by = auth.uid()
      and t.deleted_at is null
      and t.search_vector @@ websearch_to_tsquery('english', search_query)
    order by 5 desc
    limit result_limit
  )
  union all
  (
    select 'note'::text, n.id, n.title, left(n.content_text, 120), ts_rank(n.search_vector, websearch_to_tsquery('english', search_query))
    from public.notes n
    where n.created_by = auth.uid()
      and n.deleted_at is null
      and n.search_vector @@ websearch_to_tsquery('english', search_query)
    order by 5 desc
    limit result_limit
  )
  union all
  (
    select 'folder'::text, f.id, f.name, f.path, 0.5::real
    from public.folders f
    where f.created_by = auth.uid()
      and f.deleted_at is null
      and f.name ilike '%' || search_query || '%'
    limit result_limit
  )
  union all
  (
    select 'tag'::text, g.id, g.name, g.scope, 0.4::real
    from public.tags g
    where g.created_by = auth.uid()
      and g.deleted_at is null
      and g.name ilike '%' || search_query || '%'
    limit result_limit
  );
end;
$$;

grant execute on function public.global_search(text, int) to authenticated;
