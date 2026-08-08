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
