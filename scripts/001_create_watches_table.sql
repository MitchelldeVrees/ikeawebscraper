-- Create watches table to store user product watches
create table if not exists public.watches (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_name text not null, -- stores the requested article number
  store_id text not null,
  store_name text not null,
  desired_quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true not null
);

-- Create index for faster email lookups
create index if not exists watches_email_idx on public.watches(email);

-- Create index for faster active watches lookups
create index if not exists watches_is_active_idx on public.watches(is_active);

-- Create index for store lookups
create index if not exists watches_store_id_idx on public.watches(store_id);

-- No RLS needed - this is a simple email-based system without authentication
alter table public.watches disable row level security;
