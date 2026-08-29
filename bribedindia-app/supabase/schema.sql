create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('paid_bribe', 'refused_to_pay')),
  department_code text not null,
  department_other text,
  state text not null,
  district text,
  service text,
  approx_month int,
  approx_year int,
  bribe_amount numeric,
  description text,
  has_evidence boolean not null default false,
  status text not null default 'unverified'
    check (status in ('unverified', 'pending_review', 'verified')),
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_status on public.reports (status);
create index if not exists idx_reports_state on public.reports (state);
create index if not exists idx_reports_department on public.reports (department_code);
create index if not exists idx_reports_cluster on public.reports (department_code, state, lower(btrim(service)));

create table if not exists public.submission_log (
  id bigint generated always as identity primary key,
  client_session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_submission_log_session on public.submission_log (client_session_id, created_at);

alter table public.reports enable row level security;
alter table public.submission_log enable row level security;

create policy "public read reports" on public.reports
  for select using (true);

create policy "authenticated read reports" on public.reports
  for select to authenticated using (true);

create policy "authenticated update reports" on public.reports
  for update to authenticated using (true);
