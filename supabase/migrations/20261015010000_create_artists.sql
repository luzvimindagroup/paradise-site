-- Artists. An artist can only be published with written permission on file (with its date) and a photo
-- with alt text. The same rule is enforced in code (src/lib/generic/artists/public.ts).
-- RLS is ON with no policies: only the server (service role) can touch it.
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  discipline text not null,
  neighborhood text,
  tagline text,
  published boolean not null default false,

  permission_on_file boolean not null default false,
  permission_date date,

  image_path text,
  image_alt text,

  links jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artists_permission_needs_date check (not permission_on_file or permission_date is not null),
  constraint artists_image_needs_alt check (image_path is null or coalesce(image_alt, '') <> ''),
  constraint artists_publish_needs_permission_and_photo
    check (not published or (permission_on_file and permission_date is not null and image_path is not null))
);

create trigger artists_set_updated_at
before update on public.artists
for each row execute function public.set_updated_at();

alter table public.artists enable row level security;
revoke all on public.artists from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artist-images', 'artist-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
