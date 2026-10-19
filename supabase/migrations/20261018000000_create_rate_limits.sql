-- Rate limiting shared across all server instances. Keys are scrambled (hashed) network addresses,
-- never raw IPs. Rows are counters only; old ones are swept automatically.
create table public.rate_limits (
  key text primary key,
  hits int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Count one hit for `p_key` inside a fixed window that restarts once it ages out. Returns true while under the limit.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds int, p_max int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits int;
  v_cutoff timestamptz := now() - make_interval(secs => p_window_seconds);
begin
  insert into public.rate_limits (key, hits, window_start) values (p_key, 1, now())
  on conflict (key) do update set
    hits = case when public.rate_limits.window_start < v_cutoff then 1 else public.rate_limits.hits + 1 end,
    window_start = case when public.rate_limits.window_start < v_cutoff then now() else public.rate_limits.window_start end
  returning hits into v_hits;

  -- Sweep stale counters every time (the table is tiny), so nothing lingers past a day.
  delete from public.rate_limits where window_start < now() - interval '1 day' and key <> p_key;

  return v_hits <= p_max;
end;
$$;

revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
