-- ====================================================
-- Primary admin email guard
-- Ensures nodirkhudayarov@gmail.com always receives admin role
-- ====================================================

update public.profiles
set role = 'admin'
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
    new.email,
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
