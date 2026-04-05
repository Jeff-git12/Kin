-- Events setup for KIN /events page
-- Run in Supabase SQL Editor

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  location text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  image_url text,
  created_at timestamptz not null default now()
);

-- If your table already exists, this keeps fields aligned with app usage.
alter table public.events add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.events add column if not exists title text;
alter table public.events add column if not exists description text;
alter table public.events add column if not exists location text;
alter table public.events add column if not exists starts_at timestamptz;
alter table public.events add column if not exists ends_at timestamptz;
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists created_at timestamptz default now();

-- Optional but recommended: multi-day/end times must not be earlier than start.
alter table public.events
  drop constraint if exists events_end_after_start;
alter table public.events
  add constraint events_end_after_start
  check (ends_at is null or ends_at >= starts_at);

create index if not exists events_starts_at_idx on public.events (starts_at asc);
create index if not exists events_ends_at_idx on public.events (ends_at asc);
create index if not exists events_created_at_idx on public.events (created_at desc);

alter table public.events enable row level security;

-- Public read for browsing signed-in and signed-out
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'Events select public'
  ) then
    create policy "Events select public"
      on public.events for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- Storage note:
-- Create a public bucket named "event-images" in Supabase Storage for event photos.

-- Signed-in users can create events only as themselves
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'Events insert own'
  ) then
    create policy "Events insert own"
      on public.events for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;
