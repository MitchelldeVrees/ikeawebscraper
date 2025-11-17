-- Profiles table for storing user preferences (driving address, fuel usage, etc.)
create table if not exists public.profiles (
  user_id uuid primary key,
  email text not null,
  street text,
  house_number text,
  city text,
  postal_code text,
  gas_usage numeric,
  fuel_price numeric,
  address_lat double precision,
  address_lng double precision,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure newer columns exist even if table was previously created with older schema
alter table public.profiles
  add column if not exists street text,
  add column if not exists house_number text,
  add column if not exists city text,
  add column if not exists postal_code text,
  add column if not exists gas_usage numeric,
  add column if not exists fuel_price numeric,
  add column if not exists address_lat double precision,
  add column if not exists address_lng double precision;

-- Drop legacy address column if it still exists (optional)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'address'
  ) then
    alter table public.profiles drop column address;
  end if;
end $$;

create unique index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_email_idx on public.profiles(email);

alter table public.profiles disable row level security;
