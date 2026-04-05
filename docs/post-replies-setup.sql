-- Town Square replies/comments setup
-- Run in Supabase SQL Editor

create table if not exists public.post_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_replies_post_id_idx
  on public.post_replies (post_id, created_at);

alter table public.post_replies enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'post_replies'
      and policyname = 'Post replies select public'
  ) then
    create policy "Post replies select public"
      on public.post_replies for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'post_replies'
      and policyname = 'Post replies insert own'
  ) then
    create policy "Post replies insert own"
      on public.post_replies for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;
