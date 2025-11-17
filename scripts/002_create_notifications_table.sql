-- Create notifications table to track sent alerts and prevent duplicates
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  product_name text not null,
  product_price numeric,
  product_image text,
  ikea_product_id text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster watch_id lookups
create index if not exists notifications_watch_id_idx on public.notifications(watch_id);

-- Create composite index to check if notification was already sent for a product
create index if not exists notifications_watch_product_idx on public.notifications(watch_id, ikea_product_id);

-- No RLS needed - this is a simple email-based system without authentication
alter table public.notifications disable row level security;
