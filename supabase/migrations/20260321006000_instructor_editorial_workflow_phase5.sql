-- ====================================================
-- Instructor editorial workflow (Phase 5)
-- ====================================================

create table if not exists public.course_submissions (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  category text,
  price integer not null default 0,
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_submissions
  add column if not exists subtitle text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists price integer not null default 0,
  add column if not exists status text not null default 'draft',
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists review_note text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.course_submissions
  drop constraint if exists course_submissions_status_check;

alter table public.course_submissions
  add constraint course_submissions_status_check
  check (status in ('draft', 'submitted', 'changes_requested', 'published'));

create or replace function public.set_course_submissions_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_course_submissions_updated_at on public.course_submissions;
create trigger set_course_submissions_updated_at
  before update on public.course_submissions
  for each row execute procedure public.set_course_submissions_updated_at();

alter table public.course_submissions enable row level security;

drop policy if exists "Instructors can manage own submissions" on public.course_submissions;
create policy "Instructors can manage own submissions"
  on public.course_submissions for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

drop policy if exists "Admin can manage all submissions" on public.course_submissions;
create policy "Admin can manage all submissions"
  on public.course_submissions for all
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

drop policy if exists "Admin can update profiles" on public.profiles;
create policy "Admin can update profiles"
  on public.profiles for update
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

create index if not exists course_submissions_instructor_status_idx
  on public.course_submissions(instructor_id, status, updated_at desc);

create index if not exists course_submissions_status_submitted_idx
  on public.course_submissions(status, submitted_at desc, updated_at desc);
