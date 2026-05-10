-- ====================================================
-- Auth student/instructor gate
-- Students are usable immediately after signup; instructor status remains
-- admin-reviewed; new account/login signals appear in admin operations.
-- ====================================================

create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(new.email, ''));
  v_full_name text := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');
  v_role text := case
    when lower(coalesce(new.email, '')) = 'nodirkhudayarov@gmail.com'
      then 'admin'
    else 'student'
  end;
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(v_full_name, split_part(v_email, '@', 1)),
    v_email,
    v_role
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    role = case
      when excluded.email = 'nodirkhudayarov@gmail.com' then 'admin'
      else public.profiles.role
    end;

  if to_regclass('public.operational_events') is not null then
    insert into public.operational_events (
      user_id,
      scope,
      event_type,
      severity,
      entity_type,
      entity_id,
      title,
      detail,
      dedupe_key
    )
    values (
      new.id,
      'security',
      'auth_user_created',
      'info',
      'auth_user',
      new.id::text,
      case when v_role = 'admin'
        then 'Primary admin auth user yaratildi'
        else 'Yangi student auth user yaratildi'
      end,
      jsonb_build_object(
        'email', v_email,
        'fullName', coalesce(v_full_name, split_part(v_email, '@', 1)),
        'role', v_role,
        'emailConfirmedAt', new.email_confirmed_at
      ),
      'auth-user-created:' || new.id::text
    )
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
  end if;

  if to_regclass('public.notification_jobs') is not null and v_role <> 'admin' then
    insert into public.notification_jobs (
      user_id,
      channel,
      event_type,
      status,
      recipient,
      subject,
      template_key,
      provider,
      payload,
      dedupe_key
    )
    values (
      new.id,
      'in_app',
      'auth_user_created',
      'queued',
      'admin',
      'Yangi student tizimga qo''shildi',
      'auth_user_created',
      'admin_panel',
      jsonb_build_object(
        'email', v_email,
        'fullName', coalesce(v_full_name, split_part(v_email, '@', 1)),
        'userId', new.id
      ),
      'admin-auth-user-created:' || new.id::text
    )
    on conflict (dedupe_key) where dedupe_key is not null do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name, email, role)
select
  u.id,
  coalesce(
    nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
    split_part(lower(coalesce(u.email, '')), '@', 1)
  ),
  lower(u.email),
  case
    when lower(coalesce(u.email, '')) = 'nodirkhudayarov@gmail.com'
      then 'admin'
    else coalesce(p.role, 'student')
  end
from auth.users u
left join public.profiles p on p.id = u.id
where u.email is not null
on conflict (id) do update
set
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  email = excluded.email,
  role = case
    when excluded.email = 'nodirkhudayarov@gmail.com'
      then 'admin'
    else public.profiles.role
  end;

create or replace function public.guard_profile_role_update()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.role is distinct from old.role and not private.is_platform_admin() then
    raise exception 'Profile role can be changed only by platform admin'
      using errcode = '42501';
  end if;

  if lower(coalesce(old.email, new.email, '')) = 'nodirkhudayarov@gmail.com'
     and new.role <> 'admin' then
    raise exception 'Primary admin role cannot be removed'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_role_update on public.profiles;
create trigger guard_profile_role_update
  before update on public.profiles
  for each row execute procedure public.guard_profile_role_update();

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create index if not exists instructor_applications_user_status_idx
  on public.instructor_applications(user_id, status, updated_at desc);

create index if not exists operational_events_security_created_idx
  on public.operational_events(scope, event_type, created_at desc)
  where scope = 'security';
