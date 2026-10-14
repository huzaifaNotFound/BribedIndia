insert into auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
values (
  'admin@bribedindia.demo',
  crypt('Demo@1234', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
)
on conflict (email) do nothing;

insert into public.submission_log (client_session_id)
select '00000000-0000-0000-0000-000000000000'
where not exists (
  select 1 from public.submission_log
  where client_session_id = '00000000-0000-0000-0000-000000000000'
);
