-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- Users are NOT stored in a table of ours: they live in Supabase Auth
-- (Dashboard -> Authentication -> Users). Only tasks are created here.
--
-- If you ran the older version of this file before, uncomment these 2 lines first:
-- drop table if exists tasks;
-- drop table if exists users;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'inprogress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_idx on tasks(user_id);

-- Block direct access with the public (anon) key. The Express backend uses the
-- service_role key, which bypasses RLS, so the app keeps working.
alter table tasks enable row level security;
