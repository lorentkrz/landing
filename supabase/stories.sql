-- Stories table and policies (add if missing)
create extension if not exists "pgcrypto";

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  thumb_url text,
  venue_id uuid references public.venues(id),
  views integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists stories_user_idx on public.stories(user_id);
create index if not exists stories_expires_idx on public.stories(expires_at);

alter table public.stories enable row level security;

create policy if not exists "stories_select_auth" on public.stories
  for select using (auth.role() = 'authenticated' and expires_at > now());

create policy if not exists "stories_insert_owner" on public.stories
  for insert with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy if not exists "stories_update_owner" on public.stories
  for update using (auth.role() = 'authenticated' and user_id = auth.uid());

create policy if not exists "stories_delete_owner" on public.stories
  for delete using (auth.role() = 'authenticated' and user_id = auth.uid());

create policy if not exists "stories_update_views_any_auth" on public.stories
  for update using (auth.role() = 'authenticated') with check (true);

create or replace function public.increment_story_view(p_story_id uuid)
returns void
language sql
security definer
as $$
  update public.stories
     set views = coalesce(views, 0) + 1
   where id = p_story_id;
$$;

insert into storage.buckets (id, name, public)
values ('stories', 'stories', true)
on conflict (id) do nothing;

create policy if not exists "stories_objects_read" on storage.objects
  for select using (bucket_id = 'stories' and auth.role() = 'authenticated');

create policy if not exists "stories_objects_insert" on storage.objects
  for insert with check (bucket_id = 'stories' and auth.role() = 'authenticated' and owner = auth.uid());

create policy if not exists "stories_objects_update" on storage.objects
  for update using (bucket_id = 'stories' and auth.role() = 'authenticated' and owner = auth.uid());

create policy if not exists "stories_objects_delete" on storage.objects
  for delete using (bucket_id = 'stories' and auth.role() = 'authenticated' and owner = auth.uid());
