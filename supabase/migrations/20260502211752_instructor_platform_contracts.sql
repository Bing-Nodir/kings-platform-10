-- ====================================================
-- Instructor platform contracts
-- Admin owner + instructor marketplace + certificates + edu shop hardening
-- ====================================================

-- Instructor applications now carry the public instructor identity and
-- certificate preferences that admin reviews before granting instructor role.
alter table public.instructor_applications
  add column if not exists organization_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists public_bio text,
  add column if not exists photo_url text,
  add column if not exists certificates jsonb not null default '[]'::jsonb,
  add column if not exists certificate_template jsonb not null default '{}'::jsonb;

alter table public.instructor_applications
  drop constraint if exists instructor_applications_certificates_json_check;

alter table public.instructor_applications
  add constraint instructor_applications_certificates_json_check
  check (jsonb_typeof(certificates) = 'array');

alter table public.instructor_applications
  drop constraint if exists instructor_applications_certificate_template_json_check;

alter table public.instructor_applications
  add constraint instructor_applications_certificate_template_json_check
  check (jsonb_typeof(certificate_template) = 'object');

-- Public courses need to know who owns them so approved instructors can publish
-- only their own courses while admin keeps full control.
alter table public.courses
  add column if not exists category text,
  add column if not exists status text not null default 'published',
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.courses
  drop constraint if exists courses_status_check;

alter table public.courses
  add constraint courses_status_check
  check (status in ('draft', 'published', 'archived'));

create or replace function public.set_courses_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
  before update on public.courses
  for each row execute procedure public.set_courses_updated_at();

drop policy if exists "Instructor can manage own courses" on public.courses;
create policy "Instructor can manage own courses"
  on public.courses for all
  using (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  )
  with check (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  );

drop policy if exists "Instructor can manage own course documents" on public.site_documents;
create policy "Instructor can manage own course documents"
  on public.site_documents for all
  using (
    kind = 'course'
    and metadata ->> 'instructorId' = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  )
  with check (
    kind = 'course'
    and metadata ->> 'instructorId' = auth.uid()::text
    and status in ('draft', 'published', 'archived')
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  );

create index if not exists site_documents_course_instructor_idx
  on public.site_documents ((metadata ->> 'instructorId'))
  where kind = 'course';

-- Certificate templates are owned by instructors but visible to enrolled
-- students for issued certificates.
create table if not exists public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  title text not null default 'Kings Education Certificate',
  organization_name text,
  signature_name text,
  signature_title text,
  signature_image_url text,
  certificate_body text,
  accent_color text not null default '#064e3b',
  seal_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (instructor_id, course_id)
);

alter table public.certificate_templates enable row level security;

create or replace function public.set_certificate_templates_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_certificate_templates_updated_at on public.certificate_templates;
create trigger set_certificate_templates_updated_at
  before update on public.certificate_templates
  for each row execute procedure public.set_certificate_templates_updated_at();

drop policy if exists "Admin can manage certificate templates" on public.certificate_templates;
create policy "Admin can manage certificate templates"
  on public.certificate_templates for all
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

drop policy if exists "Instructor can manage own certificate templates" on public.certificate_templates;
create policy "Instructor can manage own certificate templates"
  on public.certificate_templates for all
  using (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  )
  with check (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('instructor', 'admin')
    )
  );

drop policy if exists "Enrolled students can view certificate templates" on public.certificate_templates;
create policy "Enrolled students can view certificate templates"
  on public.certificate_templates for select
  using (
    exists (
      select 1 from public.enrollments
      where user_id = auth.uid()
        and course_id = certificate_templates.course_id
    )
  );

create index if not exists certificate_templates_course_idx
  on public.certificate_templates(course_id);

-- Issued certificates keep immutable verification data and a snapshot of the
-- template used at issue time.
alter table public.certificates
  add column if not exists certificate_no text,
  add column if not exists verification_code text,
  add column if not exists student_name text,
  add column if not exists course_title text,
  add column if not exists instructor_name text,
  add column if not exists template jsonb not null default '{}'::jsonb,
  add column if not exists completed_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists certificates_certificate_no_unique_idx
  on public.certificates(certificate_no)
  where certificate_no is not null;

create unique index if not exists certificates_verification_code_unique_idx
  on public.certificates(verification_code)
  where verification_code is not null;

create or replace function public.set_certificates_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at
  before update on public.certificates
  for each row execute procedure public.set_certificates_updated_at();

drop policy if exists "Users can update own certificates" on public.certificates;
create policy "Users can update own certificates"
  on public.certificates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.issue_course_certificate(
  p_course_id text,
  p_student_name text default null,
  p_course_title text default null,
  p_instructor_name text default null,
  p_template jsonb default '{}'::jsonb
)
returns public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing public.certificates;
  v_result public.certificates;
  v_completed_at timestamptz;
  v_certificate_no text;
  v_verification_code text;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select coalesce(completed_at, now())
    into v_completed_at
  from public.enrollments
  where user_id = v_user_id
    and course_id = p_course_id
    and (completed_at is not null or progress_percent >= 100)
  limit 1;

  if v_completed_at is null then
    raise exception 'course is not completed' using errcode = 'P0001';
  end if;

  select *
    into v_existing
  from public.certificates
  where user_id = v_user_id
    and course_id = p_course_id;

  v_certificate_no := coalesce(
    v_existing.certificate_no,
    'KINGS-' || to_char(now(), 'YYYY') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  );
  v_verification_code := coalesce(
    v_existing.verification_code,
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))
  );

  insert into public.certificates (
    user_id,
    course_id,
    issued_at,
    certificate_no,
    verification_code,
    student_name,
    course_title,
    instructor_name,
    template,
    completed_at,
    metadata
  )
  values (
    v_user_id,
    p_course_id,
    coalesce(v_existing.issued_at, v_completed_at, now()),
    v_certificate_no,
    v_verification_code,
    nullif(trim(coalesce(p_student_name, '')), ''),
    nullif(trim(coalesce(p_course_title, '')), ''),
    nullif(trim(coalesce(p_instructor_name, '')), ''),
    coalesce(p_template, '{}'::jsonb),
    v_completed_at,
    jsonb_build_object('issuedBy', 'issue_course_certificate')
  )
  on conflict (user_id, course_id) do update
    set certificate_no = coalesce(public.certificates.certificate_no, excluded.certificate_no),
        verification_code = coalesce(public.certificates.verification_code, excluded.verification_code),
        student_name = coalesce(excluded.student_name, public.certificates.student_name),
        course_title = coalesce(excluded.course_title, public.certificates.course_title),
        instructor_name = coalesce(excluded.instructor_name, public.certificates.instructor_name),
        template = case
          when excluded.template = '{}'::jsonb then public.certificates.template
          else excluded.template
        end,
        completed_at = coalesce(public.certificates.completed_at, excluded.completed_at),
        metadata = public.certificates.metadata || excluded.metadata
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.issue_course_certificate(text, text, text, text, jsonb) from public;
grant execute on function public.issue_course_certificate(text, text, text, text, jsonb) to authenticated;

-- Edu shop contract: products can be physical or digital, tracked by stock and
-- fulfillment metadata. Public UI reads active rows; admin still owns writes.
alter table public.products
  add column if not exists category text,
  add column if not exists rating numeric(3, 2) not null default 5,
  add column if not exists inventory_count integer,
  add column if not exists is_digital boolean not null default true,
  add column if not exists digital_delivery_url text,
  add column if not exists image_url text,
  add column if not exists status text not null default 'active',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.products
  drop constraint if exists products_rating_check;

alter table public.products
  add constraint products_rating_check
  check (rating >= 0 and rating <= 5);

alter table public.products
  drop constraint if exists products_inventory_count_check;

alter table public.products
  add constraint products_inventory_count_check
  check (inventory_count is null or inventory_count >= 0);

alter table public.products
  drop constraint if exists products_status_check;

alter table public.products
  add constraint products_status_check
  check (status in ('active', 'draft', 'archived', 'sold_out'));

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_products_updated_at();

create index if not exists products_status_category_idx
  on public.products(status, category, updated_at desc);
