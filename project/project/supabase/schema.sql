-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run in full any time this file changes.

create table if not exists public.telemetry_snapshots (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  health_score smallint not null,
  posture smallint not null,
  fatigue_index smallint not null,
  lighting_lux smallint not null,
  focus_score smallint not null,
  stress smallint not null
);

create index if not exists telemetry_snapshots_user_created_idx
  on public.telemetry_snapshots (user_id, created_at desc);

create table if not exists public.telemetry_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  event text not null,
  detail text not null,
  status text not null check (status in ('good', 'warning', 'critical'))
);

create index if not exists telemetry_events_user_created_idx
  on public.telemetry_events (user_id, created_at desc);

create table if not exists public.recommendation_checklists (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  recommendation_id text not null,
  title text not null,
  checklist jsonb not null,
  complete_count smallint not null,
  total_count smallint not null,
  is_complete boolean not null,
  updated_at timestamptz not null default now(),
  unique (user_id, recommendation_id)
);

-- Which roles (user/admin/authority/hospital/investigator/reviewer) this
-- task record is relevant to. Added after the table already existed for
-- some projects, hence the separate ALTER rather than being inline above.
alter table public.recommendation_checklists
  add column if not exists roles text[] not null default '{}';

-- Free-text reviewer notes included in the exported review packet.
alter table public.recommendation_checklists
  add column if not exists notes text not null default '';

alter table public.telemetry_snapshots enable row level security;
alter table public.telemetry_events enable row level security;
alter table public.recommendation_checklists enable row level security;

drop policy if exists "Users can read their own snapshots" on public.telemetry_snapshots;
create policy "Users can read their own snapshots"
  on public.telemetry_snapshots for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own snapshots" on public.telemetry_snapshots;
create policy "Users can insert their own snapshots"
  on public.telemetry_snapshots for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own events" on public.telemetry_events;
create policy "Users can read their own events"
  on public.telemetry_events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own events" on public.telemetry_events;
create policy "Users can insert their own events"
  on public.telemetry_events for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own recommendation checklists" on public.recommendation_checklists;
create policy "Users can read their own recommendation checklists"
  on public.recommendation_checklists for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own recommendation checklists" on public.recommendation_checklists;
create policy "Users can insert their own recommendation checklists"
  on public.recommendation_checklists for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recommendation checklists" on public.recommendation_checklists;
create policy "Users can update their own recommendation checklists"
  on public.recommendation_checklists for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Role-aware access control (Advanced bounty).
--
-- Everything above scopes every table to `auth.uid() = user_id` — a plain
-- user can only ever see their own rows, no matter what. That's correct for
-- a normal user, but an oversight role (admin/authority/hospital/
-- investigator/reviewer) needs to see recommendation checklists ACROSS
-- users, and that has to be decided by Postgres, not by a client-side filter
-- that already downloaded the data. This section adds that.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  -- Kept in sync with the AgentRole union in src/types/telemetry.ts.
  role text not null default 'user'
    check (role in ('user', 'admin', 'authority', 'hospital', 'investigator', 'reviewer')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- NOTE: this lets a signed-in user set their OWN role, including to an
-- oversight role, with no approval step. That's intentional here so the
-- bounty can be demoed solo with one account (see SettingsPage.tsx), but it
-- is not how this should work in production — role assignment should be
-- admin-only, e.g. by removing the update policy above and only ever
-- writing `role` via a service-role backend action.

-- Reads the caller's own role. A plain SQL function (not security definer)
-- so it runs with the caller's own privileges — it only ever needs to read
-- the caller's own profile row, which the select policy above already
-- allows, so no privilege escalation is needed to make this work.
create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_oversight_role()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_role(), 'user')
    in ('admin', 'authority', 'hospital', 'investigator', 'reviewer');
$$;

-- Additive policy: Postgres OR's multiple permissive policies together for
-- the same command, so a plain user still only matches the "own rows"
-- policy above, while an oversight-role user also matches this one and
-- gets every user's rows back from the SAME query. Nothing in the frontend
-- decides this — it's enforced here.
drop policy if exists "Oversight roles can read all recommendation checklists" on public.recommendation_checklists;
create policy "Oversight roles can read all recommendation checklists"
  on public.recommendation_checklists for select
  using (public.is_oversight_role());
