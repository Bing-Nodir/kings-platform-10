-- ====================================================
-- User preferences + security audit foundation
-- ====================================================

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme_pref text not null default 'system',
  email_notifications boolean not null default true,
  push_notifications boolean not null default false,
  marketing_notifications boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences
  add column if not exists theme_pref text not null default 'system',
  add column if not exists email_notifications boolean not null default true,
  add column if not exists push_notifications boolean not null default false,
  add column if not exists marketing_notifications boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.user_preferences
  drop constraint if exists user_preferences_theme_pref_check;

alter table public.user_preferences
  add constraint user_preferences_theme_pref_check
  check (theme_pref in ('light', 'dark', 'system'));

create or replace function public.set_user_preferences_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute procedure public.set_user_preferences_updated_at();

create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.security_audit_logs
  add column if not exists detail jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table public.user_preferences enable row level security;
alter table public.security_audit_logs enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can upsert own preferences" on public.user_preferences;
create policy "Users can upsert own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own security logs" on public.security_audit_logs;
create policy "Users can view own security logs"
  on public.security_audit_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own security logs" on public.security_audit_logs;
create policy "Users can insert own security logs"
  on public.security_audit_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all security logs" on public.security_audit_logs;
create policy "Admin can view all security logs"
  on public.security_audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists user_preferences_updated_at_idx
  on public.user_preferences(updated_at desc);

create index if not exists security_audit_logs_user_created_idx
  on public.security_audit_logs(user_id, created_at desc);
