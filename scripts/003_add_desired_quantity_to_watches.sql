-- Add desired quantity tracking for watches
alter table if exists public.watches
  add column if not exists desired_quantity integer not null default 1;

-- ensure any existing nulls (if column already existed) are set
update public.watches
set desired_quantity = coalesce(desired_quantity, 1);

