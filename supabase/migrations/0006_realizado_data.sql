create table if not exists public.realizado_data (
  product     text    not null check (product in ('cppem', 'colegio', 'unicv')),
  year        integer not null,
  data        jsonb   not null default '{}',
  updated_at  timestamptz not null default now(),
  primary key (product, year)
);

create trigger realizado_data_updated_at
  before update on public.realizado_data
  for each row execute function public.cac_data_set_updated_at();

alter table public.realizado_data enable row level security;

create policy "realizado read"
  on public.realizado_data for select to authenticated using (true);

create policy "realizado insert"
  on public.realizado_data for insert to authenticated with check (true);

create policy "realizado update"
  on public.realizado_data for update to authenticated using (true) with check (true);
