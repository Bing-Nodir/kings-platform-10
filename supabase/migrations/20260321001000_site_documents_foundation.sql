-- ====================================================
-- Site documents foundation
-- Structured backend content store for catalog + public site data
-- ====================================================

create table if not exists public.site_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  slug text not null,
  title text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (kind, slug)
);

alter table public.site_documents
  add column if not exists title text,
  add column if not exists status text not null default 'draft',
  add column if not exists sort_order integer not null default 0,
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

alter table public.site_documents
  drop constraint if exists site_documents_status_check;

alter table public.site_documents
  add constraint site_documents_status_check
  check (status in ('draft', 'published', 'archived'));

create or replace function public.set_site_documents_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_documents_updated_at on public.site_documents;
create trigger set_site_documents_updated_at
  before update on public.site_documents
  for each row execute procedure public.set_site_documents_updated_at();

alter table public.site_documents enable row level security;

drop policy if exists "Public can view published site documents" on public.site_documents;
create policy "Public can view published site documents"
  on public.site_documents for select
  using (status = 'published');

drop policy if exists "Admin can manage site documents" on public.site_documents;
create policy "Admin can manage site documents"
  on public.site_documents for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists site_documents_kind_status_sort_idx
  on public.site_documents(kind, status, sort_order, updated_at desc);

create index if not exists site_documents_payload_gin_idx
  on public.site_documents using gin (payload);
