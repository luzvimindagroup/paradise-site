-- Mailing-list subscribers. We own this copy; Klaviyo gets a synced copy.
-- RLS is ON with no policies for anon/authenticated: only the server (service role) can touch it.
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_lower text generated always as (lower(email)) stored,
  zip text not null check (zip ~ '^[0-9]{5}$'),
  language text not null default 'English',
  language_assumed boolean not null default false,

  -- consent record
  consent_at timestamptz not null,
  consent_text text not null,

  -- where they came from
  page_url text,
  referrer text,
  source_slug text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,

  -- optional, asked on /welcome
  group_size text,
  price_band text,
  name text,
  city text,
  genres text[] not null default '{}',
  ticket_interest text,
  how_heard text,
  instagram text,

  -- Klaviyo sync state (status codes only, never personal data)
  klaviyo_status text not null default 'pending'
    check (klaviyo_status in ('pending', 'synced', 'failed', 'skipped')),
  klaviyo_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subscribers_email_lower_key unique (email_lower)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscribers_set_updated_at
before update on public.subscribers
for each row execute function public.set_updated_at();

alter table public.subscribers enable row level security;
revoke all on public.subscribers from anon, authenticated;
