-- ====================================================
-- Instructor workspace suite
-- Application approval, media uploads, Q&A, and payouts
-- ====================================================

create extension if not exists "pgcrypto";

-- =============================================
-- INSTRUCTOR APPLICATIONS
-- =============================================

create table if not exists public.instructor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  professional_title text,
  expertise text,
  portfolio_url text,
  payout_method text,
  statement text not null,
  status text not null default 'pending',
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.instructor_applications
  add column if not exists professional_title text,
  add column if not exists expertise text,
  add column if not exists portfolio_url text,
  add column if not exists payout_method text,
  add column if not exists statement text not null default '',
  add column if not exists status text not null default 'pending',
  add column if not exists admin_note text,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists submitted_at timestamptz not null default now(),
  add column if not exists reviewed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.instructor_applications
  drop constraint if exists instructor_applications_status_check;

alter table public.instructor_applications
  add constraint instructor_applications_status_check
  check (status in ('pending', 'approved', 'rejected', 'changes_requested'));

create or replace function public.set_instructor_applications_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_instructor_applications_updated_at on public.instructor_applications;
create trigger set_instructor_applications_updated_at
  before update on public.instructor_applications
  for each row execute procedure public.set_instructor_applications_updated_at();

alter table public.instructor_applications enable row level security;

drop policy if exists "Users can view own instructor application" on public.instructor_applications;
create policy "Users can view own instructor application"
  on public.instructor_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can submit own instructor application" on public.instructor_applications;
create policy "Users can submit own instructor application"
  on public.instructor_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can revise own instructor application" on public.instructor_applications;
create policy "Users can revise own instructor application"
  on public.instructor_applications for update
  using (auth.uid() = user_id and status in ('pending', 'changes_requested', 'rejected'))
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Admin can manage instructor applications" on public.instructor_applications;
create policy "Admin can manage instructor applications"
  on public.instructor_applications for all
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

create index if not exists instructor_applications_status_created_idx
  on public.instructor_applications(status, submitted_at desc, updated_at desc);

-- =============================================
-- COURSE ASSETS / VIDEO UPLOADS
-- =============================================

create table if not exists public.course_assets (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.course_submissions(id) on delete cascade,
  course_id text not null,
  module_id text,
  lesson_id text,
  title text not null,
  asset_type text not null default 'video',
  storage_bucket text not null default 'course-media',
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  status text not null default 'uploaded',
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_assets
  add column if not exists instructor_id uuid references public.profiles(id) on delete cascade,
  add column if not exists submission_id uuid references public.course_submissions(id) on delete cascade,
  add column if not exists course_id text not null default '',
  add column if not exists module_id text,
  add column if not exists lesson_id text,
  add column if not exists title text not null default 'Untitled asset',
  add column if not exists asset_type text not null default 'video',
  add column if not exists storage_bucket text not null default 'course-media',
  add column if not exists storage_path text not null default '',
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint,
  add column if not exists status text not null default 'uploaded',
  add column if not exists analysis jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.course_assets
  drop constraint if exists course_assets_asset_type_check;

alter table public.course_assets
  add constraint course_assets_asset_type_check
  check (asset_type in ('video', 'resource', 'thumbnail', 'transcript'));

alter table public.course_assets
  drop constraint if exists course_assets_status_check;

alter table public.course_assets
  add constraint course_assets_status_check
  check (status in ('uploaded', 'processing', 'ready', 'failed'));

create or replace function public.set_course_assets_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_course_assets_updated_at on public.course_assets;
create trigger set_course_assets_updated_at
  before update on public.course_assets
  for each row execute procedure public.set_course_assets_updated_at();

alter table public.course_assets enable row level security;

drop policy if exists "Instructors can manage own course assets" on public.course_assets;
create policy "Instructors can manage own course assets"
  on public.course_assets for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

drop policy if exists "Admin can manage all course assets" on public.course_assets;
create policy "Admin can manage all course assets"
  on public.course_assets for all
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

create index if not exists course_assets_instructor_course_idx
  on public.course_assets(instructor_id, course_id, created_at desc);

create index if not exists course_assets_submission_lesson_idx
  on public.course_assets(submission_id, lesson_id, updated_at desc);

-- =============================================
-- STUDENT QUESTIONS FOR INSTRUCTORS
-- =============================================

create table if not exists public.course_questions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  lesson_id text,
  student_id uuid not null references public.profiles(id) on delete cascade,
  instructor_id uuid references public.profiles(id) on delete set null,
  question_text text not null,
  answer_text text,
  status text not null default 'open',
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_questions
  add column if not exists lesson_id text,
  add column if not exists instructor_id uuid references public.profiles(id) on delete set null,
  add column if not exists answer_text text,
  add column if not exists status text not null default 'open',
  add column if not exists answered_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.course_questions
  drop constraint if exists course_questions_status_check;

alter table public.course_questions
  add constraint course_questions_status_check
  check (status in ('open', 'answered', 'closed'));

create or replace function public.set_course_questions_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_course_questions_updated_at on public.course_questions;
create trigger set_course_questions_updated_at
  before update on public.course_questions
  for each row execute procedure public.set_course_questions_updated_at();

alter table public.course_questions enable row level security;

drop policy if exists "Students can create own course questions" on public.course_questions;
create policy "Students can create own course questions"
  on public.course_questions for insert
  with check (auth.uid() = student_id);

drop policy if exists "Students can view own course questions" on public.course_questions;
create policy "Students can view own course questions"
  on public.course_questions for select
  using (auth.uid() = student_id);

drop policy if exists "Instructors can view questions for own courses" on public.course_questions;
create policy "Instructors can view questions for own courses"
  on public.course_questions for select
  using (
    auth.uid() = instructor_id
    or exists (
      select 1 from public.courses c
      where c.id = course_questions.course_id
        and c.instructor_id = auth.uid()
    )
    or exists (
      select 1 from public.course_submissions s
      where s.slug = course_questions.course_id
        and s.instructor_id = auth.uid()
        and s.status = 'published'
    )
  );

drop policy if exists "Instructors can answer questions for own courses" on public.course_questions;
create policy "Instructors can answer questions for own courses"
  on public.course_questions for update
  using (
    auth.uid() = instructor_id
    or exists (
      select 1 from public.courses c
      where c.id = course_questions.course_id
        and c.instructor_id = auth.uid()
    )
    or exists (
      select 1 from public.course_submissions s
      where s.slug = course_questions.course_id
        and s.instructor_id = auth.uid()
        and s.status = 'published'
    )
  )
  with check (
    auth.uid() = instructor_id
    or exists (
      select 1 from public.courses c
      where c.id = course_questions.course_id
        and c.instructor_id = auth.uid()
    )
    or exists (
      select 1 from public.course_submissions s
      where s.slug = course_questions.course_id
        and s.instructor_id = auth.uid()
        and s.status = 'published'
    )
  );

drop policy if exists "Admin can manage course questions" on public.course_questions;
create policy "Admin can manage course questions"
  on public.course_questions for all
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

create index if not exists course_questions_course_status_idx
  on public.course_questions(course_id, status, created_at desc);

create index if not exists course_questions_instructor_status_idx
  on public.course_questions(instructor_id, status, created_at desc);

create index if not exists course_questions_student_course_idx
  on public.course_questions(student_id, course_id, created_at desc);

drop policy if exists "Instructors can view students in own courses" on public.profiles;
create policy "Instructors can view students in own courses"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.enrollments e
      join public.courses c on c.id = e.course_id
      where e.user_id = profiles.id
        and c.instructor_id = auth.uid()
    )
    or exists (
      select 1
      from public.course_questions q
      where q.student_id = profiles.id
        and (
          q.instructor_id = auth.uid()
          or exists (
            select 1 from public.courses c
            where c.id = q.course_id and c.instructor_id = auth.uid()
          )
          or exists (
            select 1 from public.course_submissions s
            where s.slug = q.course_id
              and s.instructor_id = auth.uid()
              and s.status = 'published'
          )
        )
    )
  );

-- =============================================
-- INSTRUCTOR PAYOUTS
-- =============================================

create table if not exists public.instructor_payouts (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_revenue integer not null default 0,
  platform_fee integer not null default 0,
  payout_amount integer not null default 0,
  status text not null default 'pending',
  provider_reference text,
  note text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instructor_payouts
  add column if not exists gross_revenue integer not null default 0,
  add column if not exists platform_fee integer not null default 0,
  add column if not exists payout_amount integer not null default 0,
  add column if not exists status text not null default 'pending',
  add column if not exists provider_reference text,
  add column if not exists note text,
  add column if not exists paid_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.instructor_payouts
  drop constraint if exists instructor_payouts_status_check;

alter table public.instructor_payouts
  add constraint instructor_payouts_status_check
  check (status in ('pending', 'processing', 'paid', 'failed'));

create or replace function public.set_instructor_payouts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_instructor_payouts_updated_at on public.instructor_payouts;
create trigger set_instructor_payouts_updated_at
  before update on public.instructor_payouts
  for each row execute procedure public.set_instructor_payouts_updated_at();

alter table public.instructor_payouts enable row level security;

drop policy if exists "Instructors can view own payouts" on public.instructor_payouts;
create policy "Instructors can view own payouts"
  on public.instructor_payouts for select
  using (auth.uid() = instructor_id);

drop policy if exists "Admin can manage instructor payouts" on public.instructor_payouts;
create policy "Admin can manage instructor payouts"
  on public.instructor_payouts for all
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

create index if not exists instructor_payouts_instructor_period_idx
  on public.instructor_payouts(instructor_id, period_start desc, period_end desc);

-- =============================================
-- STORAGE BUCKET FOR INSTRUCTOR VIDEOS
-- =============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-media',
  'course-media',
  false,
  524288000,
  array[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Instructors can read own course media" on storage.objects;
create policy "Instructors can read own course media"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'course-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );

drop policy if exists "Instructors can upload own course media" on storage.objects;
create policy "Instructors can upload own course media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  );

drop policy if exists "Instructors can update own course media" on storage.objects;
create policy "Instructors can update own course media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'course-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Instructors can delete own course media" on storage.objects;
create policy "Instructors can delete own course media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );
