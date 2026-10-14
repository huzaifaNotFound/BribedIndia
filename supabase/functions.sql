create or replace function public.recompute_clusters()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reports r
  set status = 'pending_review'
  where r.status = 'unverified'
    and (r.department_code, r.state, lower(btrim(r.service))) in (
      select
        inner_report.department_code,
        inner_report.state,
        lower(btrim(inner_report.service))
      from public.reports inner_report
      where inner_report.status = 'unverified'
      group by
        inner_report.department_code,
        inner_report.state,
        lower(btrim(inner_report.service))
      having count(*) >= 3
        and max(inner_report.created_at) - min(inner_report.created_at) <= interval '90 days'
    );
end;
$$;

create or replace function public.submit_report(
  p_report_type text,
  p_department_code text,
  p_department_other text,
  p_state text,
  p_district text,
  p_service text,
  p_approx_month int,
  p_approx_year int,
  p_bribe_amount numeric,
  p_description text,
  p_client_session_id text
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_report public.reports;
begin
  if p_client_session_id is null or p_client_session_id = '' then
    raise exception 'missing_client_session';
  end if;

  if p_bribe_amount is not null and p_bribe_amount > 2000000 then
    raise exception 'amount_too_large';
  end if;

  select count(*)
  into v_count
  from public.submission_log
  where client_session_id = p_client_session_id
    and created_at > now() - interval '10 minutes';

  if v_count >= 3 then
    raise exception 'rate_limited';
  end if;

  insert into public.submission_log (client_session_id)
  values (p_client_session_id);

  insert into public.reports (
    report_type,
    department_code,
    department_other,
    state,
    district,
    service,
    approx_month,
    approx_year,
    bribe_amount,
    description
  )
  values (
    p_report_type,
    p_department_code,
    p_department_other,
    p_state,
    p_district,
    p_service,
    p_approx_month,
    p_approx_year,
    p_bribe_amount,
    p_description
  )
  returning * into v_report;

  perform public.recompute_clusters();

  return v_report;
end;
$$;

create or replace function public.mark_cluster_verified(
  p_department_code text,
  p_state text,
  p_service text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reports
  set status = 'verified'
  where status = 'pending_review'
    and department_code = p_department_code
    and state = p_state
    and lower(btrim(service)) = lower(btrim(p_service));
end;
$$;

create or replace function public.pending_clusters()
returns table (
  department_code text,
  state text,
  service text,
  report_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    department_code,
    state,
    lower(btrim(service)) as service,
    count(*) as report_count
  from public.reports
  where status = 'pending_review'
  group by department_code, state, lower(btrim(service))
  having count(*) >= 3
  order by report_count desc;
$$;
