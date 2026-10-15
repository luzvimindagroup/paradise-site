-- Events. Date and venue are stored but only shown publicly when their *_public flag is true
-- (enforced in one place: src/lib/generic/events/public.ts). All flags default to false.
-- RLS is ON with no policies: only the server (service role) can touch it.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  published boolean not null default false,

  starts_at timestamptz,
  date_public boolean not null default false,
  venue_name text,
  venue_public boolean not null default false,
  ticket_url text,

  image_path text,
  image_alt text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- guardrails: you can't make something public that doesn't exist, and every photo needs alt text
  constraint events_date_public_needs_date check (not date_public or starts_at is not null),
  constraint events_venue_public_needs_venue check (not venue_public or coalesce(venue_name, '') <> ''),
  constraint events_image_needs_alt check (image_path is null or coalesce(image_alt, '') <> '')
);

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;

-- Public bucket for event photos (anyone can view a photo by its link; only the server can upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
