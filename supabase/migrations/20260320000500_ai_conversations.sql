-- =============================================
-- Kings Education Platform — AI Conversations
-- Supabase Dashboard > SQL Editor ga copy qilib run qiling
-- =============================================

create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   text not null,
  messages    jsonb not null default '[]',
  updated_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.ai_conversations enable row level security;

drop policy if exists "Users can manage own ai conversations" on public.ai_conversations;
create policy "Users can manage own ai conversations"
  on public.ai_conversations for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
