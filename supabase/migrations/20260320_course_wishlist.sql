-- ====================================================
-- Course wishlist feature -- Kings Education Platform
-- Supabase SQL Editor ga run qiling
-- ====================================================

create table if not exists public.wishlist_courses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  course_id  text not null,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.wishlist_courses enable row level security;

create policy "Users can manage own wishlist"
  on public.wishlist_courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists wishlist_courses_user_created_idx
  on public.wishlist_courses(user_id, created_at desc);
