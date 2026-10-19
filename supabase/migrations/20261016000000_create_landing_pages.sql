-- Landing pages for ads and links. A page may stand alone or link to an artist and/or an event;
-- it is only shown while everything it links to is itself public (src/lib/generic/landing/public.ts).
-- RLS is ON with no policies: only the server (service role) can touch it.
create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  published boolean not null default false,

  headline text not null,
  subheadline text,
  body text,
  cta_label text not null default 'Get first access',

  -- "restrict": an artist or event with a landing page can't be deleted out from under it
  artist_id uuid references public.artists(id) on delete restrict,
  event_id uuid references public.events(id) on delete restrict,

  image_path text,
  image_alt text,

  seo_title text,
  seo_description text,
  index_in_search boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint landing_image_needs_alt check (image_path is null or coalesce(image_alt, '') <> '')
);

create trigger landing_pages_set_updated_at
before update on public.landing_pages
for each row execute function public.set_updated_at();

alter table public.landing_pages enable row level security;
revoke all on public.landing_pages from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('landing-images', 'landing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Ad-tracking readiness: keep the ad platform's click id and a per-signup event id with each signup,
-- so a conversion can later be reported once (browser pixel and server API agree on the same id).
alter table public.subscribers add column if not exists fbclid text;
alter table public.subscribers add column if not exists signup_event_id uuid;
