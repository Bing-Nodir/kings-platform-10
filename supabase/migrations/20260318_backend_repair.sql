-- =============================================
-- Kings Education Platform - backend repair
-- Run this in Supabase SQL Editor for existing projects
-- =============================================

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  phone text,
  bio text,
  company_name text,
  language_pref text not null default 'uz',
  role text not null default 'student',
  created_at timestamptz not null default now()
);

alter table if exists public.enrollments
  add column if not exists last_lesson_id text;

alter table if exists public.learning_sessions
  add column if not exists lesson_id text;

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new', 'in_review', 'resolved')),
  created_at  timestamptz not null default now()
);

alter table if exists public.contact_messages enable row level security;

do $$
begin
  if to_regclass('public.enrollments') is not null then
    execute 'drop policy if exists "Admin can view all enrollments" on public.enrollments';
    execute $sql$
      create policy "Admin can view all enrollments"
        on public.enrollments for select
        using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    $sql$;
  end if;

  if to_regclass('public.certificates') is not null then
    execute 'drop policy if exists "Users can insert own certificates" on public.certificates';
    execute $sql$
      create policy "Users can insert own certificates"
        on public.certificates for insert with check (auth.uid() = user_id)
    $sql$;

    execute 'drop policy if exists "Admin can view all certificates" on public.certificates';
    execute $sql$
      create policy "Admin can view all certificates"
        on public.certificates for select
        using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    $sql$;
  end if;

  if to_regclass('public.learning_sessions') is not null then
    execute 'drop policy if exists "Admin can view all learning sessions" on public.learning_sessions';
    execute $sql$
      create policy "Admin can view all learning sessions"
        on public.learning_sessions for select
        using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    $sql$;
  end if;

  if to_regclass('public.orders') is not null then
    execute 'drop policy if exists "Users can insert own orders" on public.orders';
    execute $sql$
      create policy "Users can insert own orders"
        on public.orders for insert with check (auth.uid() = user_id)
    $sql$;
  end if;
end
$$;

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admin can view all contact messages" on public.contact_messages;
create policy "Admin can view all contact messages"
  on public.contact_messages for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin can update contact messages" on public.contact_messages;
create policy "Admin can update contact messages"
  on public.contact_messages for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
