-- cac_data: shared dashboard data, keyed by (year, product).
-- All authenticated users can read and write (team-shared storage).

create table if not exists public.cac_data (
  year        integer not null,
  product     text    not null check (product in ('cppem', 'colegio', 'unicv')),
  data        jsonb   not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (year, product)
);

-- Keep updated_at fresh on every update
create or replace function public.cac_data_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cac_data_updated_at on public.cac_data;
create trigger cac_data_updated_at
  before update on public.cac_data
  for each row execute function public.cac_data_set_updated_at();

-- Row level security
alter table public.cac_data enable row level security;

drop policy if exists "cac_data read"   on public.cac_data;
drop policy if exists "cac_data insert" on public.cac_data;
drop policy if exists "cac_data update" on public.cac_data;
drop policy if exists "cac_data delete" on public.cac_data;

create policy "cac_data read"
  on public.cac_data
  for select
  to authenticated
  using (true);

create policy "cac_data insert"
  on public.cac_data
  for insert
  to authenticated
  with check (true);

create policy "cac_data update"
  on public.cac_data
  for update
  to authenticated
  using (true)
  with check (true);

create policy "cac_data delete"
  on public.cac_data
  for delete
  to authenticated
  using (true);
