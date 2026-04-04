-- Run this entire file in Supabase: SQL Editor → New query → Run
-- Fixes: "Storage bucket avatars is missing" and upload permission errors.

-- 1) Bucket (public URLs from the app)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- 2) Policies (safe to re-run)
drop policy if exists "Avatar upload own folder" on storage.objects;
drop policy if exists "Avatar update own" on storage.objects;
drop policy if exists "Avatars public read" on storage.objects;

create policy "Avatar upload own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Avatar update own"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Avatars public read"
  on storage.objects for select to public
  using (bucket_id = 'avatars');
