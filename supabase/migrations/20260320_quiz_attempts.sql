-- ====================================================
-- Quiz Attempts jadvali — Kings Education Platform
-- Supabase SQL Editor ga run qiling
-- ====================================================

create table if not exists public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  course_id    text not null,
  score        int  not null default 0,
  total        int  not null default 0,
  percent      int  not null default 0,
  passed       boolean not null default false,
  answers      jsonb not null default '[]',
  completed_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can manage own quiz attempts"
  on public.quiz_attempts for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admin can view all quiz attempts"
  on public.quiz_attempts for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create index if not exists quiz_attempts_user_course_idx
  on public.quiz_attempts(user_id, course_id);

-- Profiles jadvaliga qo'shimcha ustunlar
alter table public.profiles
  add column if not exists phone       text,
  add column if not exists bio         text,
  add column if not exists company_name text,
  add column if not exists language_pref text not null default 'uz'
    check (language_pref in ('uz', 'ru', 'en'));
