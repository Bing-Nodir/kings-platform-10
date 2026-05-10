-- Keep profiles RLS non-recursive. Cross-table "classmate" visibility should
-- be served by explicit API joins, not by profiles policies that recurse
-- through enrollments/courses policies.

drop policy if exists "Instructors can view students in own courses" on public.profiles;
drop policy if exists "Students can view classmates in shared courses" on public.profiles;

drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
  on public.profiles for select
  to authenticated
  using (private.is_platform_admin());

drop policy if exists "Admin can update profiles" on public.profiles;
create policy "Admin can update profiles"
  on public.profiles for update
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Platform admin full access" on public.profiles;
create policy "Platform admin full access"
  on public.profiles for all
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());
