-- =============================================
-- Kings Education Platform — User Notes
-- Supabase Dashboard > SQL Editor ga copy qilib run qiling
-- =============================================

create table if not exists public.user_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   text not null,
  content     text not null default '',
  updated_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.user_notes enable row level security;

create policy "Users can manage own notes"
  on public.user_notes for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
