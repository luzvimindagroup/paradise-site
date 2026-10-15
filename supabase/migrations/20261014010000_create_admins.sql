-- Who may use /admin. Only emails in this table can request a login link,
-- and every admin page re-checks it on the server.
-- RLS is ON with no policies: only the server (service role) can touch it.
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_lower text generated always as (lower(email)) stored,
  created_at timestamptz not null default now(),
  constraint admins_email_lower_key unique (email_lower)
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- First admin:
-- insert into public.admins (email) values ('luzviminda.group@gmail.com');
