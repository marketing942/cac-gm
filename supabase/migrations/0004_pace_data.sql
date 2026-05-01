create table if not exists public.pace_data (
  product     text    not null check (product in ('cppem', 'colegio', 'unicv')),
  year        integer not null,
  month       integer not null check (month between 1 and 12),
  meta        numeric not null default 0,
  realizado   numeric not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (product, year, month)
);

create trigger pace_data_updated_at
  before update on public.pace_data
  for each row execute function public.cac_data_set_updated_at();

alter table public.pace_data enable row level security;

create policy "pace read"
  on public.pace_data for select to authenticated using (true);

create policy "pace insert"
  on public.pace_data for insert to authenticated with check (true);

create policy "pace update"
  on public.pace_data for update to authenticated using (true) with check (true);
