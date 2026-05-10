-- ====================================================
-- Backend hardening migration -- Kings Education Platform
-- Supabase SQL Editor ga run qiling
-- ====================================================

alter table public.profiles
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists company_name text,
  add column if not exists language_pref text not null default 'uz'
    check (language_pref in ('uz', 'ru', 'en'));

alter table if exists public.orders
  add column if not exists payment_method text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text;

alter table if exists public.orders
  drop constraint if exists orders_payment_method_check;

alter table if exists public.orders
  add constraint orders_payment_method_check
  check (
    payment_method is null or
    payment_method in ('card', 'payme', 'click')
  );

create index if not exists profiles_role_idx
  on public.profiles(role);

do $$
begin
  if to_regclass('public.orders') is not null then
    execute 'create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc)';
    execute 'create index if not exists orders_status_created_idx on public.orders(status, created_at desc)';
  end if;
end
$$;

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);

do $$
begin
  if to_regclass('public.learning_sessions') is not null then
    execute 'create index if not exists learning_sessions_user_course_created_idx on public.learning_sessions(user_id, course_id, created_at desc)';
  end if;
end
$$;
