-- ====================================================
-- Operational events + notification queue (Phase 4)
-- ====================================================

create table if not exists public.operational_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  scope text not null,
  event_type text not null,
  severity text not null default 'info',
  entity_type text,
  entity_id text,
  title text,
  detail jsonb not null default '{}'::jsonb,
  dedupe_key text,
  created_at timestamptz not null default now()
);

alter table public.operational_events
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists scope text not null default 'system',
  add column if not exists event_type text not null default 'unknown',
  add column if not exists severity text not null default 'info',
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists title text,
  add column if not exists detail jsonb not null default '{}'::jsonb,
  add column if not exists dedupe_key text,
  add column if not exists created_at timestamptz not null default now();

alter table public.operational_events
  drop constraint if exists operational_events_scope_check;

alter table public.operational_events
  add constraint operational_events_scope_check
  check (
    scope in ('order', 'payment', 'security', 'contact', 'support', 'notification', 'system')
  );

alter table public.operational_events
  drop constraint if exists operational_events_severity_check;

alter table public.operational_events
  add constraint operational_events_severity_check
  check (severity in ('info', 'warning', 'error'));

create unique index if not exists operational_events_dedupe_key_uidx
  on public.operational_events(dedupe_key)
  where dedupe_key is not null;

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  channel text not null,
  event_type text not null,
  status text not null default 'queued',
  recipient text,
  subject text,
  template_key text,
  provider text,
  provider_reference text,
  attempts int not null default 0,
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  last_attempt_at timestamptz,
  error_detail text,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_jobs
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists channel text not null default 'email',
  add column if not exists event_type text not null default 'unknown',
  add column if not exists status text not null default 'queued',
  add column if not exists recipient text,
  add column if not exists subject text,
  add column if not exists template_key text,
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists attempts int not null default 0,
  add column if not exists available_at timestamptz not null default now(),
  add column if not exists sent_at timestamptz,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists error_detail text,
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists dedupe_key text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.notification_jobs
  drop constraint if exists notification_jobs_channel_check;

alter table public.notification_jobs
  add constraint notification_jobs_channel_check
  check (channel in ('email', 'sms', 'in_app', 'webhook'));

alter table public.notification_jobs
  drop constraint if exists notification_jobs_status_check;

alter table public.notification_jobs
  add constraint notification_jobs_status_check
  check (status in ('queued', 'processing', 'sent', 'failed', 'cancelled'));

create or replace function public.set_notification_jobs_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_notification_jobs_updated_at on public.notification_jobs;
create trigger set_notification_jobs_updated_at
  before update on public.notification_jobs
  for each row execute procedure public.set_notification_jobs_updated_at();

create unique index if not exists notification_jobs_dedupe_key_uidx
  on public.notification_jobs(dedupe_key)
  where dedupe_key is not null;

alter table public.operational_events enable row level security;
alter table public.notification_jobs enable row level security;

drop policy if exists "Users can view own operational events" on public.operational_events;
create policy "Users can view own operational events"
  on public.operational_events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own operational events" on public.operational_events;
create policy "Users can insert own operational events"
  on public.operational_events for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can manage operational events" on public.operational_events;
create policy "Admin can manage operational events"
  on public.operational_events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Users can view own notification jobs" on public.notification_jobs;
create policy "Users can view own notification jobs"
  on public.notification_jobs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification jobs" on public.notification_jobs;
create policy "Users can insert own notification jobs"
  on public.notification_jobs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can manage notification jobs" on public.notification_jobs;
create policy "Admin can manage notification jobs"
  on public.notification_jobs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists operational_events_scope_created_idx
  on public.operational_events(scope, created_at desc);

create index if not exists operational_events_user_created_idx
  on public.operational_events(user_id, created_at desc);

create index if not exists notification_jobs_status_available_idx
  on public.notification_jobs(status, available_at asc, created_at desc);

create index if not exists notification_jobs_user_created_idx
  on public.notification_jobs(user_id, created_at desc);
