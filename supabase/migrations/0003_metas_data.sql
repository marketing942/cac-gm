create table if not exists public.metas_data (
  product     text    not null check (product in ('cppem', 'colegio', 'unicv')),
  year        integer not null,
  data        jsonb   not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (product, year)
);

create trigger metas_data_updated_at
  before update on public.metas_data
  for each row execute function public.cac_data_set_updated_at();

alter table public.metas_data enable row level security;

create policy "metas read"
  on public.metas_data for select to authenticated using (true);

create policy "metas insert"
  on public.metas_data for insert to authenticated with check (true);

create policy "metas update"
  on public.metas_data for update to authenticated using (true) with check (true);

create policy "metas delete"
  on public.metas_data for delete to authenticated using (true);
