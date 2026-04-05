-- KIN moderation reports (v1)
-- Run in Supabase SQL Editor.

create table if not exists public.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('post', 'reply', 'service_listing', 'event')),
  source_id uuid not null,
  reason text not null default 'inappropriate_content',
  notes text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists moderation_flags_source_idx
  on public.moderation_flags (source_type, source_id);

create index if not exists moderation_flags_reporter_idx
  on public.moderation_flags (reporter_user_id, created_at desc);

alter table public.moderation_flags enable row level security;

drop policy if exists "reporters_can_insert_flags" on public.moderation_flags;
create policy "reporters_can_insert_flags"
  on public.moderation_flags
  for insert
  to authenticated
  with check (auth.uid() = reporter_user_id);

drop policy if exists "reporters_can_view_own_flags" on public.moderation_flags;
create policy "reporters_can_view_own_flags"
  on public.moderation_flags
  for select
  to authenticated
  using (auth.uid() = reporter_user_id);
