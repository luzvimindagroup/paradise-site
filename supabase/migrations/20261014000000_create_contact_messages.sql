-- Contact-form messages. RLS is ON with no policies: only the server (service role) can touch it.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  email text not null,
  message text not null,
  page_url text,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
