-- Zin & Gin CMS + reservations (Supabase)
-- Run in Supabase SQL editor or via CLI: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null check (role in ('owner', 'manager', 'worker')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role) where active = true;

-- ---------------------------------------------------------------------------
-- reservations
-- ---------------------------------------------------------------------------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  phone text not null,
  email text not null,
  room_number text,
  guest_count int not null check (guest_count between 1 and 20),
  booking_date date not null,
  meal_session text not null check (meal_session in ('breakfast', 'dinner')),
  booking_time text not null,
  seating_preference text not null,
  remarks text not null default '',
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'alternative_suggested', 'declined', 'cancelled')
  ),
  manager_note text not null default '',
  suggested_time text,
  suggested_seating text,
  confirmed_by uuid references public.profiles (id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reservations_status_idx on public.reservations (status);
create index reservations_booking_date_idx on public.reservations (booking_date);

-- ---------------------------------------------------------------------------
-- menu
-- ---------------------------------------------------------------------------
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories (id) on delete restrict,
  name text not null,
  description text not null default '',
  price numeric(8, 2) not null check (price >= 0),
  is_veg boolean not null default false,
  is_vegan boolean not null default false,
  has_gluten boolean not null default false,
  has_nuts boolean not null default false,
  is_spicy boolean not null default false,
  visible boolean not null default true,
  sort_order int not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_category_sort_idx on public.menu_items (category_id, sort_order);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_date date not null,
  image_url text not null default '',
  cta_label text,
  cta_link text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_published_date_idx on public.events (published, event_date);

-- ---------------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------------
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reservations_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

create trigger menu_items_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

create trigger events_updated_at before update on public.events
for each row execute function public.set_updated_at();

create trigger gallery_updated_at before update on public.gallery
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auth helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and active = true
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'owner';
$$;

create or replace function public.can_manage_reservations()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('owner', 'manager');
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.reservations enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;

-- profiles: staff read own; owner reads all (for confirmed_by display)
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_owner());

-- reservations: public insert; staff read; managers update
create policy reservations_insert_public on public.reservations
  for insert to anon, authenticated
  with check (true);

create policy reservations_select_staff on public.reservations
  for select to authenticated
  using (public.is_staff());

create policy reservations_update_managers on public.reservations
  for update to authenticated
  using (public.can_manage_reservations())
  with check (public.can_manage_reservations());

-- menu categories/items: public read visible; owner write
create policy menu_categories_select_public on public.menu_categories
  for select to anon, authenticated
  using (visible = true or public.is_owner());

create policy menu_categories_write_owner on public.menu_categories
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy menu_items_select_public on public.menu_items
  for select to anon, authenticated
  using (
    visible = true
    and exists (
      select 1 from public.menu_categories c
      where c.id = category_id and c.visible = true
    )
    or public.is_owner()
  );

create policy menu_items_write_owner on public.menu_items
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- events: public read published; owner write
create policy events_select_public on public.events
  for select to anon, authenticated
  using (published = true or public.is_owner());

create policy events_write_owner on public.events
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- gallery: public read visible; owner write
create policy gallery_select_public on public.gallery
  for select to anon, authenticated
  using (visible = true or public.is_owner());

create policy gallery_write_owner on public.gallery
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ---------------------------------------------------------------------------
-- storage buckets (run once; policies below)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('gallery', 'gallery', true),
  ('events', 'events', true),
  ('menu', 'menu', true)
on conflict (id) do nothing;

create policy storage_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('gallery', 'events', 'menu'));

create policy storage_owner_write on storage.objects
  for insert to authenticated
  with check (bucket_id in ('gallery', 'events', 'menu') and public.is_owner());

create policy storage_owner_update on storage.objects
  for update to authenticated
  using (bucket_id in ('gallery', 'events', 'menu') and public.is_owner());

create policy storage_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id in ('gallery', 'events', 'menu') and public.is_owner());
