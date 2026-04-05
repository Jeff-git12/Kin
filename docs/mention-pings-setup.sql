-- Mention pings for Town Square
-- Run in Supabase SQL Editor

create table if not exists public.mention_pings (
  id uuid primary key default gen_random_uuid(),
  mentioned_user_id uuid not null references auth.users (id) on delete cascade,
  mentioned_by_user_id uuid not null references auth.users (id) on delete cascade,
  source_type text not null check (source_type in ('post', 'reply')),
  source_post_id uuid not null references public.posts (id) on delete cascade,
  source_reply_id uuid references public.post_replies (id) on delete cascade,
  mention_text text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists mention_pings_mentioned_user_idx
  on public.mention_pings (mentioned_user_id, created_at desc);

alter table public.mention_pings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mention_pings'
      and policyname = 'Mention pings select own'
  ) then
    create policy "Mention pings select own"
      on public.mention_pings for select
      to authenticated
      using (auth.uid() = mentioned_user_id or auth.uid() = mentioned_by_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mention_pings'
      and policyname = 'Mention pings insert own'
  ) then
    create policy "Mention pings insert own"
      on public.mention_pings for insert
      to authenticated
      with check (auth.uid() = mentioned_by_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mention_pings'
      and policyname = 'Mention pings update own target'
  ) then
    create policy "Mention pings update own target"
      on public.mention_pings for update
      to authenticated
      using (auth.uid() = mentioned_user_id)
      with check (auth.uid() = mentioned_user_id);
  end if;
end $$;
