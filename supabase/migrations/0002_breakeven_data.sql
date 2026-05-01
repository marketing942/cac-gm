create table if not exists public.breakeven_data (
  product     text not null check (product in ('cppem', 'unicv')),
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (product)
);

create trigger breakeven_data_updated_at
  before update on public.breakeven_data
  for each row execute function public.cac_data_set_updated_at();

alter table public.breakeven_data enable row level security;

create policy "breakeven read"
  on public.breakeven_data for select to authenticated using (true);

create policy "breakeven insert"
  on public.breakeven_data for insert to authenticated with check (true);

create policy "breakeven update"
  on public.breakeven_data for update to authenticated using (true) with check (true);

create policy "breakeven delete"
  on public.breakeven_data for delete to authenticated using (true);
