# KIN data model notes (Supabase)

This file is a **starting point** for SQL and Storage setup. Adjust names to match your project.

## Storage buckets (public for MVP)

### Create buckets (fixes “Bucket not found”)

KIN expects these bucket **names exactly**. Create them in **Supabase Dashboard → Storage → New bucket**, **or** run:

```sql
-- Profile photos (required for avatar upload in the app)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Town Square / post images (optional until you post with a photo)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;
```

Then add the **storage policies** below so logged-in users can upload into their own folder.

**Fast path:** run the single file **`docs/storage-setup-avatars.sql`** in the SQL Editor (creates bucket + avatar policies in one go).

| Bucket         | Purpose        | Object path examples                    |
| -------------- | -------------- | --------------------------------------- |
| `avatars`      | Profile photos | `{user_id}/avatar`                       |
| `post-images`  | Post images    | `{user_id}/{uuid}.jpg`                   |
| `documents`    | (future) PDFs  | `{user_id}/{uuid}-{filename}`           |
| `recipe-media` | (future)       | `recipes/{recipe_id}/{uuid}.jpg`        |
| `meetup-media` | (future)       | `meetups/{meetup_id}/{uuid}.jpg`        |

Enable **public** read on `avatars` and `post-images` if you use `getPublicUrl`. For private files, use signed URLs instead.

### Example storage policies (authenticated upload, public read)

Tighten these as your product matures.

```sql
-- Avatars: users upload only to their folder
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

-- Post images: same pattern
create policy "Post image insert own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Post images public read"
  on storage.objects for select to public
  using (bucket_id = 'post-images');
```

## Tables

### `profiles` (required for onboarding)

Create the table if it does not exist (id must match `auth.users.id`):

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  city text not null,
  bio text not null,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Read own profile (and optionally allow public read of limited fields later)
create policy "Profiles select own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Insert / update only your own row (needed for upsert from the app)
create policy "Profiles insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Profiles update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

Add a column for the Storage public URL if you use avatars:

```sql
alter table public.profiles
  add column if not exists avatar_url text;
```

If saves still fail with a **row-level security** error, your policies do not match the SQL above — run these in the Supabase SQL editor.

### `posts` (Town Square and similar)

```sql
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text,
  title text not null,
  body text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts readable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

create policy "Users insert own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users update own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id);

create policy "Users delete own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);
```

### `service_listings` (Trusted Services)

The app reads and writes this table from `/trusted-services`. **Run the full script:**

**`docs/service-listings-setup.sql`**

Summary: `user_id`, `category` (`contractor` | `tutor` | `babysitter` | `accountant` | `dog_walker`), `title`, `description`, `location`, `contact_name`, `created_at`. RLS allows **public read** (`anon` + `authenticated`) and **insert** only for signed-in users with `user_id = auth.uid()`.

### `documents` (future)

Metadata row + Storage path; never store binary in Postgres.

```sql
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  title text not null,
  mime_type text,
  created_at timestamptz not null default now()
);
```

### `recipes` (future)

```sql
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  hero_image_url text,
  created_at timestamptz not null default now()
);
```

### `meetups` (future)

```sql
create table public.meetups (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  location_label text,
  cover_image_url text,
  created_at timestamptz not null default now()
);
```

## App code

- Upload helpers: `src/app/lib/storage.ts`
- Bucket names: `STORAGE_BUCKETS`
