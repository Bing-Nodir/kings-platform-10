-- ====================================================
-- Student mode discussions and reputation controls
-- Enrolled students can discuss course content together. Moderation is enforced
-- at database level, and violations affect the student's credit score.
-- ====================================================

create extension if not exists "pgcrypto";

create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create table if not exists public.student_reputation (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credit_score integer not null default 100,
  violations_count integer not null default 0,
  warning_acknowledged_at timestamptz,
  last_violation_at timestamptz,
  muted_until timestamptz,
  pricing_penalty_percent integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_reputation_credit_score_check
    check (credit_score >= 0 and credit_score <= 100),
  constraint student_reputation_violations_count_check
    check (violations_count >= 0),
  constraint student_reputation_pricing_penalty_check
    check (pricing_penalty_percent >= 0 and pricing_penalty_percent <= 50)
);

create table if not exists public.student_credit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text,
  discussion_message_id uuid,
  event_type text not null default 'system',
  points_delta integer not null default 0,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint student_credit_events_event_type_check
    check (event_type in ('warning_acknowledged', 'moderation_penalty', 'admin_adjustment', 'system'))
);

create table if not exists public.course_discussion_messages (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  lesson_id text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  status text not null default 'visible',
  moderation_reason text,
  penalty_points integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_discussion_messages_body_length_check
    check (char_length(trim(body)) between 1 and 1200),
  constraint course_discussion_messages_status_check
    check (status in ('visible', 'flagged', 'blocked', 'removed')),
  constraint course_discussion_messages_penalty_points_check
    check (penalty_points >= 0 and penalty_points <= 50)
);

alter table public.student_reputation enable row level security;
alter table public.student_credit_events enable row level security;
alter table public.course_discussion_messages enable row level security;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
  or coalesce(auth.role(), '') = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'nodirkhudayarov@gmail.com';
$$;

revoke all on function private.is_platform_admin() from public;
grant execute on function private.is_platform_admin() to authenticated, service_role;

create or replace function private.student_pricing_penalty(p_score integer)
returns integer
language sql
immutable
as $$
  select case
    when p_score >= 80 then 0
    when p_score >= 60 then 5
    when p_score >= 40 then 10
    else 20
  end;
$$;

create or replace function private.contains_discussion_violation(p_body text)
returns boolean
language plpgsql
immutable
as $$
declare
  v_normalized text := lower(coalesce(p_body, ''));
begin
  -- The list is intentionally conservative and catches common Uzbek/English abuse.
  return v_normalized ~* (
    '(^|[^[:alpha:]])(' ||
    'fuck|shit|bitch|asshole|idiot|moron|stupid|dumb|' ||
    'сука|бля|бляд|хуй|пизд|еба|мудак|идиот|тупой|' ||
    'jalab|jallab|ahmoq|tentak|haromi|iflos|sik|suka|blya' ||
    ')([^[:alpha:]]|$)'
  );
end;
$$;

create or replace function private.set_student_reputation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_student_reputation_updated_at on public.student_reputation;
create trigger set_student_reputation_updated_at
  before update on public.student_reputation
  for each row execute procedure private.set_student_reputation_updated_at();

create or replace function private.set_course_discussion_messages_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_course_discussion_messages_updated_at on public.course_discussion_messages;
create trigger set_course_discussion_messages_updated_at
  before update on public.course_discussion_messages
  for each row execute procedure private.set_course_discussion_messages_updated_at();

create or replace function private.protect_student_reputation_user_update()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if private.is_platform_admin() then
    new.pricing_penalty_percent = private.student_pricing_penalty(new.credit_score);
    return new;
  end if;

  if auth.uid() is distinct from old.user_id then
    raise exception 'cannot update another student reputation'
      using errcode = '42501';
  end if;

  if new.credit_score is distinct from old.credit_score
    or new.violations_count is distinct from old.violations_count
    or new.last_violation_at is distinct from old.last_violation_at
    or new.muted_until is distinct from old.muted_until
    or new.pricing_penalty_percent is distinct from old.pricing_penalty_percent
  then
    raise exception 'credit score can only be changed by moderation or admin'
      using errcode = '42501';
  end if;

  new.user_id = old.user_id;
  new.metadata = old.metadata;
  return new;
end;
$$;

drop trigger if exists protect_student_reputation_user_update on public.student_reputation;
create trigger protect_student_reputation_user_update
  before update on public.student_reputation
  for each row execute procedure private.protect_student_reputation_user_update();

create or replace function private.prepare_student_reputation_insert()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.is_platform_admin() and auth.uid() is distinct from new.user_id then
    raise exception 'cannot create another student reputation'
      using errcode = '42501';
  end if;

  if not private.is_platform_admin() then
    new.credit_score = 100;
    new.violations_count = 0;
    new.last_violation_at = null;
    new.muted_until = null;
    new.pricing_penalty_percent = 0;
    new.metadata = '{}'::jsonb;
  else
    new.pricing_penalty_percent = private.student_pricing_penalty(new.credit_score);
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_student_reputation_insert on public.student_reputation;
create trigger prepare_student_reputation_insert
  before insert on public.student_reputation
  for each row execute procedure private.prepare_student_reputation_insert();

create or replace function private.record_discussion_warning_acknowledgement()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.warning_acknowledged_at is null
    and new.warning_acknowledged_at is not null
  then
    insert into public.student_credit_events (
      user_id,
      event_type,
      points_delta,
      reason,
      metadata
    )
    values (
      new.user_id,
      'warning_acknowledged',
      0,
      'Student discussion qoidalarini tasdiqladi.',
      jsonb_build_object('acknowledgedAt', new.warning_acknowledged_at)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists record_discussion_warning_acknowledgement on public.student_reputation;
create trigger record_discussion_warning_acknowledgement
  after update of warning_acknowledged_at on public.student_reputation
  for each row execute procedure private.record_discussion_warning_acknowledgement();

create or replace function private.moderate_course_discussion_message()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_current_score integer := 100;
  v_next_score integer;
begin
  new.body = trim(new.body);

  insert into public.student_reputation (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;

  select credit_score
    into v_current_score
  from public.student_reputation
  where user_id = new.user_id;

  if exists (
    select 1
    from public.student_reputation
    where user_id = new.user_id
      and muted_until is not null
      and muted_until > now()
  ) then
    new.status = 'blocked';
    new.moderation_reason = 'Student vaqtincha discussion yozishdan cheklangan.';
    new.penalty_points = 0;
    return new;
  end if;

  if private.contains_discussion_violation(new.body) then
    new.status = 'blocked';
    new.moderation_reason = 'Discussion qoidasi buzildi: hurmatsiz yoki haqoratli so''z aniqlandi.';
    new.penalty_points = case
      when v_current_score >= 80 then 10
      when v_current_score >= 50 then 15
      else 20
    end;
  else
    new.status = coalesce(nullif(new.status, ''), 'visible');
    new.penalty_points = 0;
    new.moderation_reason = null;
  end if;

  return new;
end;
$$;

drop trigger if exists moderate_course_discussion_message on public.course_discussion_messages;
create trigger moderate_course_discussion_message
  before insert on public.course_discussion_messages
  for each row execute procedure private.moderate_course_discussion_message();

create or replace function private.apply_course_discussion_penalty()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_next_score integer;
begin
  if new.penalty_points <= 0 then
    return new;
  end if;

  update public.student_reputation
  set
    credit_score = greatest(0, credit_score - new.penalty_points),
    violations_count = violations_count + 1,
    last_violation_at = now(),
    muted_until = case
      when credit_score - new.penalty_points < 40 then now() + interval '24 hours'
      when credit_score - new.penalty_points < 60 then now() + interval '2 hours'
      else muted_until
    end,
    pricing_penalty_percent =
      private.student_pricing_penalty(greatest(0, credit_score - new.penalty_points)),
    metadata = metadata || jsonb_build_object(
      'lastModerationReason',
      new.moderation_reason,
      'lastDiscussionMessageId',
      new.id
    )
  where user_id = new.user_id
  returning credit_score into v_next_score;

  insert into public.student_credit_events (
    user_id,
    course_id,
    discussion_message_id,
    event_type,
    points_delta,
    reason,
    metadata
  )
  values (
    new.user_id,
    new.course_id,
    new.id,
    'moderation_penalty',
    -new.penalty_points,
    new.moderation_reason,
    jsonb_build_object('nextCreditScore', v_next_score)
  );

  return new;
end;
$$;

drop trigger if exists apply_course_discussion_penalty on public.course_discussion_messages;
create trigger apply_course_discussion_penalty
  after insert on public.course_discussion_messages
  for each row execute procedure private.apply_course_discussion_penalty();

drop policy if exists "Students can view own reputation" on public.student_reputation;
create policy "Students can view own reputation"
  on public.student_reputation for select
  using (auth.uid() = user_id);

drop policy if exists "Students can create own reputation" on public.student_reputation;
create policy "Students can create own reputation"
  on public.student_reputation for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students can update own discussion warning" on public.student_reputation;
create policy "Students can update own discussion warning"
  on public.student_reputation for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin can manage student reputation" on public.student_reputation;
create policy "Admin can manage student reputation"
  on public.student_reputation for all
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Students can view own credit events" on public.student_credit_events;
create policy "Students can view own credit events"
  on public.student_credit_events for select
  using (auth.uid() = user_id);

drop policy if exists "Admin can manage credit events" on public.student_credit_events;
create policy "Admin can manage credit events"
  on public.student_credit_events for all
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Enrolled students can view course discussion" on public.course_discussion_messages;
create policy "Enrolled students can view course discussion"
  on public.course_discussion_messages for select
  using (
    (
      status = 'visible'
      and exists (
        select 1
        from public.enrollments e
        where e.user_id = auth.uid()
          and e.course_id = course_discussion_messages.course_id
      )
    )
    or user_id = auth.uid()
  );

drop policy if exists "Enrolled students can post course discussion" on public.course_discussion_messages;
create policy "Enrolled students can post course discussion"
  on public.course_discussion_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = course_discussion_messages.course_id
    )
  );

drop policy if exists "Admin can manage course discussion" on public.course_discussion_messages;
create policy "Admin can manage course discussion"
  on public.course_discussion_messages for all
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Instructors can view own course discussion" on public.course_discussion_messages;
create policy "Instructors can view own course discussion"
  on public.course_discussion_messages for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_discussion_messages.course_id
        and c.instructor_id = auth.uid()
    )
    or exists (
      select 1 from public.course_submissions s
      where s.slug = course_discussion_messages.course_id
        and s.instructor_id = auth.uid()
        and s.status = 'published'
    )
  );

drop policy if exists "Students can view classmates in shared courses" on public.profiles;
create policy "Students can view classmates in shared courses"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.enrollments viewer
      join public.enrollments classmate
        on classmate.course_id = viewer.course_id
      where viewer.user_id = auth.uid()
        and classmate.user_id = profiles.id
    )
  );

create index if not exists student_reputation_credit_idx
  on public.student_reputation(credit_score, updated_at desc);

create index if not exists student_reputation_muted_idx
  on public.student_reputation(muted_until)
  where muted_until is not null;

create index if not exists student_credit_events_user_created_idx
  on public.student_credit_events(user_id, created_at desc);

create index if not exists student_credit_events_course_created_idx
  on public.student_credit_events(course_id, created_at desc);

create index if not exists course_discussion_course_created_idx
  on public.course_discussion_messages(course_id, created_at desc);

create index if not exists course_discussion_course_status_created_idx
  on public.course_discussion_messages(course_id, status, created_at desc);

create index if not exists course_discussion_user_created_idx
  on public.course_discussion_messages(user_id, created_at desc);

create index if not exists course_discussion_lesson_created_idx
  on public.course_discussion_messages(course_id, lesson_id, created_at desc);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete
  on public.student_reputation,
     public.student_credit_events,
     public.course_discussion_messages
  to authenticated;
grant all privileges
  on public.student_reputation,
     public.student_credit_events,
     public.course_discussion_messages
  to service_role;
