insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@bribedindia.demo',
  crypt('Demo@1234', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (email) do nothing;

insert into public.submission_log (client_session_id)
select '00000000-0000-0000-0000-000000000000'
where not exists (
  select 1 from public.submission_log
  where client_session_id = '00000000-0000-0000-0000-000000000000'
);
