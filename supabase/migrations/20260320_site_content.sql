-- =============================================
-- Kings Education Platform - Site Content
-- Supabase Dashboard > SQL Editor ga copy qilib run qiling
-- =============================================

create table if not exists public.site_content (
  content_key   text primary key,
  content_value text not null,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.profiles(id) on delete set null
);

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
  before update on public.site_content
  for each row execute procedure public.set_site_content_updated_at();

create index if not exists site_content_updated_at_idx
  on public.site_content(updated_at desc);

alter table public.site_content enable row level security;

create policy "Public can view site content"
  on public.site_content for select
  using (true);

create policy "Admin can insert site content"
  on public.site_content for insert
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can update site content"
  on public.site_content for update
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can delete site content"
  on public.site_content for delete
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
