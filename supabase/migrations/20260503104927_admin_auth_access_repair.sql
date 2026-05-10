-- ====================================================
-- Admin auth access repair
-- Keeps the primary owner email able to enter /admin even when the
-- profiles row was missing, stale, or older RLS policies only trusted role.
-- ====================================================

create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.role(), '') = 'service_role'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'nodirkhudayarov@gmail.com'
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    );
$$;

revoke all on function private.is_platform_admin() from public;
grant execute on function private.is_platform_admin() to authenticated, service_role;

-- If the auth user exists but the profile row was never created, recreate it.
insert into public.profiles (id, full_name, email, role)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  lower(u.email),
  'admin'
from auth.users u
where lower(coalesce(u.email, '')) = 'nodirkhudayarov@gmail.com'
on conflict (id) do update
set
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  email = excluded.email,
  role = 'admin';

update public.profiles
set role = 'admin',
    email = lower(coalesce(email, 'nodirkhudayarov@gmail.com'))
where lower(coalesce(email, '')) = 'nodirkhudayarov@gmail.com';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    lower(new.email),
    case
      when lower(coalesce(new.email, '')) = 'nodirkhudayarov@gmail.com'
        then 'admin'
      else 'student'
    end
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    role = case
      when lower(coalesce(excluded.email, public.profiles.email, '')) = 'nodirkhudayarov@gmail.com'
        then 'admin'
      else public.profiles.role
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

do $$
declare
  admin_table text;
  admin_tables text[] := array[
    'profiles',
    'courses',
    'products',
    'offline_centers',
    'offline_sessions',
    'enrollments',
    'certificates',
    'learning_sessions',
    'orders',
    'contact_messages',
    'wishlist_courses',
    'user_notes',
    'ai_conversations',
    'quiz_attempts',
    'site_content',
    'site_documents',
    'payment_intents',
    'user_preferences',
    'security_audit_logs',
    'notification_jobs',
    'operational_events',
    'course_submissions',
    'instructor_applications',
    'course_assets',
    'course_questions',
    'instructor_payouts',
    'certificate_templates',
    'student_reputation',
    'student_credit_events',
    'course_discussion_messages'
  ];
begin
  foreach admin_table in array admin_tables loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = admin_table
    ) then
      execute format('alter table public.%I enable row level security', admin_table);
      execute format('drop policy if exists "Platform admin full access" on public.%I', admin_table);
      execute format(
        'create policy "Platform admin full access" on public.%I for all using (private.is_platform_admin()) with check (private.is_platform_admin())',
        admin_table
      );
      execute format(
        'grant select, insert, update, delete on public.%I to authenticated',
        admin_table
      );
      execute format(
        'grant all privileges on public.%I to service_role',
        admin_table
      );
    end if;
  end loop;
end
$$;
