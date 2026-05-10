-- ====================================================
-- Kings Education Platform - backend performance ultra hardening
-- Fast admin/instructor dashboards, safer RLS admin controls, and
-- explicit Data API grants for newer Supabase projects.
-- ====================================================

-- Keep every public table protected by RLS while still exposing the tables to
-- PostgREST/Data API via explicit grants. Row access remains policy-driven.
create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
  or coalesce(auth.role(), '') = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'nodirkhudayarov@gmail.com';
$$;

revoke all on function private.is_platform_admin() from public;
grant execute on function private.is_platform_admin() to authenticated, service_role;

create or replace function private.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.role is distinct from old.role and not private.is_platform_admin() then
    raise exception 'profile role can only be changed by platform admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update of role on public.profiles
  for each row execute procedure private.prevent_profile_role_escalation();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.products enable row level security;
alter table public.offline_centers enable row level security;
alter table public.offline_sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.certificates enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.orders enable row level security;
alter table public.contact_messages enable row level security;
alter table public.wishlist_courses enable row level security;
alter table public.user_notes enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.site_content enable row level security;
alter table public.site_documents enable row level security;
alter table public.payment_intents enable row level security;
alter table public.user_preferences enable row level security;
alter table public.security_audit_logs enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.operational_events enable row level security;
alter table public.course_submissions enable row level security;
alter table public.instructor_applications enable row level security;
alter table public.course_assets enable row level security;
alter table public.course_questions enable row level security;
alter table public.instructor_payouts enable row level security;
alter table public.certificate_templates enable row level security;

-- Admin is the platform owner. These policies close the practical gap where
-- admin pages could read data but fail on update/delete because older policies
-- only granted SELECT.
drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
  on public.profiles for select
  using (private.is_platform_admin());

drop policy if exists "Admin can update profiles" on public.profiles;
create policy "Admin can update profiles"
  on public.profiles for update
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Admin can manage all profiles" on public.profiles;
create policy "Admin can manage all profiles"
  on public.profiles for all
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Admin can manage all enrollments" on public.enrollments;
create policy "Admin can manage all enrollments"
  on public.enrollments for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all certificates" on public.certificates;
create policy "Admin can manage all certificates"
  on public.certificates for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all learning sessions" on public.learning_sessions;
create policy "Admin can manage all learning sessions"
  on public.learning_sessions for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all orders" on public.orders;
create policy "Admin can manage all orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all payment intents" on public.payment_intents;
create policy "Admin can manage all payment intents"
  on public.payment_intents for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all quiz attempts" on public.quiz_attempts;
create policy "Admin can manage all quiz attempts"
  on public.quiz_attempts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all wishlist rows" on public.wishlist_courses;
create policy "Admin can manage all wishlist rows"
  on public.wishlist_courses for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all user notes" on public.user_notes;
create policy "Admin can manage all user notes"
  on public.user_notes for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all ai conversations" on public.ai_conversations;
create policy "Admin can manage all ai conversations"
  on public.ai_conversations for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all user preferences" on public.user_preferences;
create policy "Admin can manage all user preferences"
  on public.user_preferences for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admin can manage all security audit logs" on public.security_audit_logs;
create policy "Admin can manage all security audit logs"
  on public.security_audit_logs for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Read/write patterns used by admin, instructor, student player, checkout,
-- certificate generation and shop.
create index if not exists profiles_role_created_idx
  on public.profiles(role, created_at desc);

create index if not exists profiles_email_lower_idx
  on public.profiles((lower(email)))
  where email is not null;

create index if not exists courses_status_category_updated_idx
  on public.courses(status, category, updated_at desc);

create index if not exists courses_instructor_status_updated_idx
  on public.courses(instructor_id, status, updated_at desc);

create index if not exists products_status_updated_idx
  on public.products(status, updated_at desc);

create index if not exists enrollments_course_progress_idx
  on public.enrollments(course_id, progress_percent, completed_at);

create index if not exists enrollments_user_last_access_idx
  on public.enrollments(user_id, last_accessed_at desc);

create index if not exists enrollments_course_last_access_idx
  on public.enrollments(course_id, last_accessed_at desc);

create index if not exists certificates_course_issued_idx
  on public.certificates(course_id, issued_at desc);

create index if not exists certificates_user_issued_idx
  on public.certificates(user_id, issued_at desc);

create index if not exists learning_sessions_course_created_idx
  on public.learning_sessions(course_id, created_at desc);

create index if not exists learning_sessions_created_idx
  on public.learning_sessions(created_at desc);

create index if not exists learning_sessions_lesson_created_idx
  on public.learning_sessions(course_id, lesson_id, created_at desc);

create index if not exists orders_item_status_created_idx
  on public.orders(item_id, status, created_at desc);

create index if not exists orders_user_status_created_idx
  on public.orders(user_id, status, created_at desc);

create index if not exists orders_created_idx
  on public.orders(created_at desc);

create index if not exists orders_payment_method_created_idx
  on public.orders(payment_method, created_at desc);

create index if not exists payment_intents_status_created_idx
  on public.payment_intents(status, created_at desc);

create index if not exists payment_intents_order_status_created_idx
  on public.payment_intents(order_id, status, created_at desc);

create index if not exists payment_intents_provider_created_idx
  on public.payment_intents(provider, created_at desc);

create index if not exists contact_messages_created_idx
  on public.contact_messages(created_at desc);

create index if not exists wishlist_courses_course_created_idx
  on public.wishlist_courses(course_id, created_at desc);

create index if not exists user_notes_course_updated_idx
  on public.user_notes(user_id, course_id, updated_at desc);

create index if not exists ai_conversations_user_updated_idx
  on public.ai_conversations(user_id, updated_at desc);

create index if not exists quiz_attempts_course_completed_idx
  on public.quiz_attempts(course_id, completed_at desc);

create index if not exists quiz_attempts_user_completed_idx
  on public.quiz_attempts(user_id, completed_at desc);

create index if not exists site_content_key_updated_idx
  on public.site_content(content_key, updated_at desc);

create index if not exists site_documents_kind_slug_status_idx
  on public.site_documents(kind, slug, status);

create index if not exists site_documents_updated_idx
  on public.site_documents(updated_at desc);

create index if not exists security_audit_logs_created_idx
  on public.security_audit_logs(created_at desc);

create index if not exists notification_jobs_status_created_idx
  on public.notification_jobs(status, created_at desc);

create index if not exists notification_jobs_available_status_idx
  on public.notification_jobs(status, available_at, created_at desc);

create index if not exists operational_events_type_created_idx
  on public.operational_events(event_type, created_at desc);

create index if not exists operational_events_entity_created_idx
  on public.operational_events(entity_type, entity_id, created_at desc);

create index if not exists course_submissions_slug_status_idx
  on public.course_submissions(slug, status);

create index if not exists course_submissions_updated_idx
  on public.course_submissions(updated_at desc);

create index if not exists instructor_applications_user_status_idx
  on public.instructor_applications(user_id, status);

create index if not exists instructor_applications_updated_idx
  on public.instructor_applications(updated_at desc);

create index if not exists course_assets_course_lesson_idx
  on public.course_assets(course_id, lesson_id, updated_at desc);

create index if not exists course_assets_status_updated_idx
  on public.course_assets(status, updated_at desc);

create index if not exists course_questions_course_created_idx
  on public.course_questions(course_id, created_at desc);

create index if not exists course_questions_status_created_idx
  on public.course_questions(status, created_at desc);

create index if not exists instructor_payouts_status_created_idx
  on public.instructor_payouts(status, created_at desc);

create index if not exists certificate_templates_instructor_updated_idx
  on public.certificate_templates(instructor_id, updated_at desc);

-- Storage object lookups for private course media.
do $$
begin
  begin
    create index if not exists storage_objects_course_media_owner_name_idx
      on storage.objects(owner, name)
      where bucket_id = 'course-media';

    create index if not exists storage_objects_course_media_updated_idx
      on storage.objects(updated_at desc)
      where bucket_id = 'course-media';
  exception
    when insufficient_privilege then null;
    when undefined_table then null;
  end;
end
$$;

grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.site_content,
  public.site_documents,
  public.courses,
  public.products,
  public.offline_centers,
  public.offline_sessions
to anon;

grant insert on table public.contact_messages to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant all privileges on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
