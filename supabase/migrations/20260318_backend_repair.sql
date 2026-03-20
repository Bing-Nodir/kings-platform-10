-- =============================================
-- Kings Education Platform - backend repair
-- Run this in Supabase SQL Editor for existing projects
-- =============================================

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

drop policy if exists "Admin can view all enrollments" on public.enrollments;
create policy "Admin can view all enrollments"
  on public.enrollments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can insert own certificates" on public.certificates;
create policy "Users can insert own certificates"
  on public.certificates for insert with check (auth.uid() = user_id);

drop policy if exists "Admin can view all certificates" on public.certificates;
create policy "Admin can view all certificates"
  on public.certificates for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin can view all learning sessions" on public.learning_sessions;
create policy "Admin can view all learning sessions"
  on public.learning_sessions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);

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
