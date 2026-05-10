-- Repair recursive RLS on profiles and lock down direct partition access.

create schema if not exists private;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.role(), '') = 'service_role'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'nodirkhudayarov@gmail.com'
    or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin';
$$;

revoke all on function private.is_platform_admin() from public;
grant execute on function private.is_platform_admin() to authenticated, service_role;

alter table if exists public.platform_event_logs_2026 enable row level security;
alter table if exists public.platform_event_logs_default enable row level security;
alter table if exists public.student_activity_2026 enable row level security;
alter table if exists public.student_activity_default enable row level security;
