alter table public.pace_data
  add column if not exists meta_leads       numeric not null default 0,
  add column if not exists leads_realizados numeric not null default 0,
  add column if not exists ticket_medio_meta numeric not null default 0,
  add column if not exists ticket_medio_real numeric not null default 0,
  add column if not exists conversao_meta    numeric not null default 0,
  add column if not exists conversao_real    numeric not null default 0;
