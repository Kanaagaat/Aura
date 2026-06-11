-- docs/supabase_waitlist.sql
create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  telegram text,
  interests jsonb,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "Allow public waitlist inserts" on public.waitlist;
create policy "Allow public waitlist inserts"
on public.waitlist
for insert
to anon
with check (true);

drop policy if exists "Block public waitlist reads" on public.waitlist;
create policy "Block public waitlist reads"
on public.waitlist
for select
to anon
using (false);
