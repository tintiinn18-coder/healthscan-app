create extension if not exists pgcrypto;

create table if not exists public.user_products (
  id uuid primary key default gen_random_uuid(),
  barcode text unique,
  product_name text not null,
  brand text,
  category text,
  ingredients_text text not null,
  nutriments jsonb default '{}'::jsonb,
  submitted_by uuid references auth.users(id) on delete set null,
  verified boolean default false,
  source text default 'user_submission',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_products enable row level security;

create policy "Anyone can read verified user products"
on public.user_products
for select
using (verified = true);

create policy "Users can read own submitted products"
on public.user_products
for select
using (auth.uid() = submitted_by);

create policy "Users can insert own products"
on public.user_products
for insert
with check (auth.uid() = submitted_by);

create policy "Users can update own unverified products"
on public.user_products
for update
using (auth.uid() = submitted_by and verified = false)
with check (auth.uid() = submitted_by and verified = false);

create index if not exists user_products_barcode_idx on public.user_products(barcode);
create index if not exists user_products_verified_idx on public.user_products(verified);

alter table public.chemical_exposure
  add column if not exists estimated_amount_mg numeric,
  add column if not exists quantity_known boolean default false,
  add column if not exists exposure_events integer default 0,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists last_seen_at timestamptz default now();

update public.chemical_exposure
set
  estimated_amount_mg = null,
  quantity_known = false,
  exposure_events = coalesce(exposure_events, 0),
  updated_at = coalesce(updated_at, now()),
  last_seen_at = coalesce(last_seen_at, now());

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_user_products_updated_at'
  ) then
    create trigger update_user_products_updated_at
    before update on public.user_products
    for each row execute function update_updated_at_column();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_chemical_exposure_updated_at'
  ) then
    create trigger update_chemical_exposure_updated_at
    before update on public.chemical_exposure
    for each row execute function update_updated_at_column();
  end if;
end $$;
