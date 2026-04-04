-- Trusted Services — run in Supabase SQL Editor
-- Enables /trusted-services directory + create form

create table public.service_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null
    check (
      category in (
        'whats_new_around_town',
        'contractor',
        'tutor',
        'babysitter',
        'accountant',
        'restaurant',
        'vet',
        'house_cleaner',
        'dog_walker'
      )
    ),
  title text not null,
  description text not null,
  location text not null,
  contact_name text not null,
  created_at timestamptz not null default now()
);

create index service_listings_created_at_idx on public.service_listings (created_at desc);

alter table public.service_listings enable row level security;

-- Signed-out and signed-in users can browse
create policy "Service listings select public"
  on public.service_listings for select
  to anon, authenticated
  using (true);

-- Only signed-in users can add rows; must set user_id to themselves
create policy "Service listings insert own"
  on public.service_listings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- If your table already exists, update the category constraint:
-- alter table public.service_listings drop constraint if exists service_listings_category_check;
-- alter table public.service_listings
--   add constraint service_listings_category_check
--   check (
--     category in (
--       'whats_new_around_town',
--       'contractor',
--       'tutor',
--       'babysitter',
--       'accountant',
--       'restaurant',
--       'vet',
--       'house_cleaner',
--       'dog_walker'
--     )
--   );
