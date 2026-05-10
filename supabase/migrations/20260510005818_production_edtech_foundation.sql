-- ====================================================
-- Production EdTech foundation
-- Partitioned activity/log streams, mastery learning gates, realtime content
-- sync events, XP leaderboard foundation, dynamic pricing, and peer review.
-- ====================================================

create extension if not exists "pgcrypto";

create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.role(), '') = 'service_role'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'nodirkhudayarov@gmail.com'
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    );
$$;

revoke all on function private.is_platform_admin() from public;
grant execute on function private.is_platform_admin() to authenticated, service_role;

-- =============================================
-- HIGH-VOLUME PARTITIONED STREAMS
-- =============================================

create table if not exists public.platform_event_logs (
  id uuid not null default gen_random_uuid(),
  level text not null default 'info',
  source text not null default 'web',
  actor_id uuid references public.profiles(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  course_id text,
  event_type text not null,
  entity_type text,
  entity_id text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (id, created_at),
  constraint platform_event_logs_level_check
    check (level in ('debug', 'info', 'warning', 'error', 'critical'))
) partition by range (created_at);

create table if not exists public.platform_event_logs_2026
  partition of public.platform_event_logs
  for values from ('2026-01-01') to ('2027-01-01');

create table if not exists public.platform_event_logs_default
  partition of public.platform_event_logs default;

create table if not exists public.student_activity (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  lesson_id text,
  activity_type text not null,
  duration_seconds integer not null default 0,
  xp_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  primary key (id, occurred_at),
  constraint student_activity_duration_check check (duration_seconds >= 0),
  constraint student_activity_xp_delta_check check (xp_delta >= -10000 and xp_delta <= 10000)
) partition by range (occurred_at);

create table if not exists public.student_activity_2026
  partition of public.student_activity
  for values from ('2026-01-01') to ('2027-01-01');

create table if not exists public.student_activity_default
  partition of public.student_activity default;

alter table public.platform_event_logs enable row level security;
alter table public.student_activity enable row level security;

drop policy if exists "Platform admin can read event logs" on public.platform_event_logs;
create policy "Platform admin can read event logs"
  on public.platform_event_logs for select
  to authenticated
  using (private.is_platform_admin());

drop policy if exists "Service role can write event logs" on public.platform_event_logs;
create policy "Service role can write event logs"
  on public.platform_event_logs for insert
  to service_role
  with check (true);

drop policy if exists "Students can view own activity" on public.student_activity;
create policy "Students can view own activity"
  on public.student_activity for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_platform_admin());

drop policy if exists "Students can write own activity" on public.student_activity;

create index if not exists platform_event_logs_created_idx
  on public.platform_event_logs(created_at desc);
create index if not exists platform_event_logs_course_created_idx
  on public.platform_event_logs(course_id, created_at desc);
create index if not exists platform_event_logs_user_created_idx
  on public.platform_event_logs(user_id, created_at desc);
create index if not exists platform_event_logs_type_created_idx
  on public.platform_event_logs(event_type, created_at desc);

create index if not exists student_activity_user_course_time_idx
  on public.student_activity(user_id, course_id, occurred_at desc);
create index if not exists student_activity_course_time_idx
  on public.student_activity(course_id, occurred_at desc);
create index if not exists student_activity_lesson_time_idx
  on public.student_activity(course_id, lesson_id, occurred_at desc);

-- =============================================
-- MASTERY LEARNING + XP
-- =============================================

create table if not exists public.lesson_prerequisites (
  course_id text not null,
  lesson_id text not null,
  lesson_index integer not null,
  previous_lesson_id text,
  required_quiz_percent integer not null default 80,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_id, lesson_id),
  constraint lesson_prerequisites_index_check check (lesson_index >= 0),
  constraint lesson_prerequisites_quiz_check check (required_quiz_percent between 0 and 100)
);

create table if not exists public.lesson_mastery_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  lesson_id text not null,
  lesson_index integer not null,
  progress_percent integer not null default 0,
  quiz_percent integer,
  status text not null default 'unlocked',
  unlocked_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id),
  constraint lesson_mastery_progress_status_check
    check (status in ('locked', 'unlocked', 'completed')),
  constraint lesson_mastery_progress_percent_check
    check (progress_percent between 0 and 100),
  constraint lesson_mastery_quiz_percent_check
    check (quiz_percent is null or quiz_percent between 0 and 100)
);

create table if not exists public.knowledge_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text,
  lesson_id text,
  source text not null,
  xp integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint knowledge_points_source_check
    check (source in ('lesson_complete', 'quiz_pass', 'assignment_review', 'admin_adjustment', 'system')),
  constraint knowledge_points_xp_check check (xp >= -10000 and xp <= 10000)
);

create table if not exists public.leaderboard_snapshots (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_xp integer not null default 0,
  completed_lessons integer not null default 0,
  passed_quizzes integer not null default 0,
  reviewed_assignments integer not null default 0,
  rank_score integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.quiz_attempts
  add column if not exists lesson_id text;

alter table public.lesson_prerequisites enable row level security;
alter table public.lesson_mastery_progress enable row level security;
alter table public.knowledge_points enable row level security;
alter table public.leaderboard_snapshots enable row level security;

create index if not exists lesson_prerequisites_course_index_idx
  on public.lesson_prerequisites(course_id, lesson_index);
create index if not exists lesson_mastery_user_course_index_idx
  on public.lesson_mastery_progress(user_id, course_id, lesson_index);
create index if not exists lesson_mastery_course_lesson_status_idx
  on public.lesson_mastery_progress(course_id, lesson_id, status);
create index if not exists quiz_attempts_user_course_lesson_completed_idx
  on public.quiz_attempts(user_id, course_id, lesson_id, completed_at desc);
create index if not exists knowledge_points_user_created_idx
  on public.knowledge_points(user_id, created_at desc);
create index if not exists knowledge_points_course_created_idx
  on public.knowledge_points(course_id, created_at desc);
create unique index if not exists knowledge_points_unique_lesson_source_idx
  on public.knowledge_points(user_id, course_id, lesson_id, source)
  where lesson_id is not null;
create index if not exists leaderboard_snapshots_rank_idx
  on public.leaderboard_snapshots(rank_score desc, updated_at desc);

create or replace function private.has_enrollment(p_user_id uuid, p_course_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.user_id = p_user_id
      and e.course_id = p_course_id
  );
$$;

create or replace function private.best_quiz_percent(
  p_user_id uuid,
  p_course_id text,
  p_lesson_id text
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(max(percent), 0)::integer
  from public.quiz_attempts qa
  where qa.user_id = p_user_id
    and qa.course_id = p_course_id
    and (qa.lesson_id = p_lesson_id or qa.lesson_id is null);
$$;

create or replace function private.can_access_lesson(
  p_user_id uuid,
  p_course_id text,
  p_lesson_id text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  v_gate public.lesson_prerequisites%rowtype;
begin
  if p_user_id is null then
    return false;
  end if;

  select *
  into v_gate
  from public.lesson_prerequisites
  where course_id = p_course_id
    and lesson_id = p_lesson_id;

  if not found then
    return private.has_enrollment(p_user_id, p_course_id);
  end if;

  if v_gate.is_preview or v_gate.lesson_index = 0 then
    return true;
  end if;

  if not private.has_enrollment(p_user_id, p_course_id) then
    return false;
  end if;

  return exists (
    select 1
    from public.lesson_mastery_progress prev
    where prev.user_id = p_user_id
      and prev.course_id = p_course_id
      and prev.lesson_id = v_gate.previous_lesson_id
      and prev.progress_percent >= 100
      and coalesce(prev.quiz_percent, private.best_quiz_percent(p_user_id, p_course_id, v_gate.previous_lesson_id)) >= v_gate.required_quiz_percent
  );
end;
$$;

grant execute on function private.can_access_lesson(uuid, text, text) to authenticated, service_role;
grant execute on function private.has_enrollment(uuid, text) to authenticated, service_role;
grant execute on function private.best_quiz_percent(uuid, text, text) to authenticated, service_role;

create or replace function private.refresh_leaderboard_snapshot(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.leaderboard_snapshots (
    user_id,
    total_xp,
    completed_lessons,
    passed_quizzes,
    reviewed_assignments,
    rank_score,
    updated_at
  )
  select
    p_user_id,
    coalesce(sum(kp.xp), 0)::integer,
    count(*) filter (where kp.source = 'lesson_complete')::integer,
    count(*) filter (where kp.source = 'quiz_pass')::integer,
    count(*) filter (where kp.source = 'assignment_review')::integer,
    coalesce(sum(kp.xp), 0)::integer,
    now()
  from public.knowledge_points kp
  where kp.user_id = p_user_id
  on conflict (user_id) do update
  set
    total_xp = excluded.total_xp,
    completed_lessons = excluded.completed_lessons,
    passed_quizzes = excluded.passed_quizzes,
    reviewed_assignments = excluded.reviewed_assignments,
    rank_score = excluded.rank_score,
    updated_at = now();
end;
$$;

create or replace function public.record_lesson_mastery_progress(
  p_course_id text,
  p_lesson_id text,
  p_lesson_index integer,
  p_previous_lesson_id text default null,
  p_duration_minutes integer default 0,
  p_total_lessons integer default 1,
  p_required_quiz_percent integer default 80
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_progress integer;
  v_completed_lessons integer;
  v_quiz_percent integer;
begin
  if v_user_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if not private.has_enrollment(v_user_id, p_course_id) then
    raise exception 'Course enrollment required' using errcode = '42501';
  end if;

  insert into public.lesson_prerequisites (
    course_id,
    lesson_id,
    lesson_index,
    previous_lesson_id,
    required_quiz_percent
  )
  values (
    p_course_id,
    p_lesson_id,
    greatest(0, p_lesson_index),
    nullif(p_previous_lesson_id, ''),
    coalesce(p_required_quiz_percent, 80)
  )
  on conflict (course_id, lesson_id) do update
  set
    lesson_index = excluded.lesson_index,
    previous_lesson_id = excluded.previous_lesson_id,
    required_quiz_percent = excluded.required_quiz_percent,
    updated_at = now();

  if not private.can_access_lesson(v_user_id, p_course_id, p_lesson_id) then
    raise exception 'Previous lesson and quiz mastery are required' using errcode = '42501';
  end if;

  v_quiz_percent := private.best_quiz_percent(v_user_id, p_course_id, p_lesson_id);

  insert into public.lesson_mastery_progress (
    user_id,
    course_id,
    lesson_id,
    lesson_index,
    progress_percent,
    quiz_percent,
    status,
    unlocked_at,
    completed_at,
    updated_at
  )
  values (
    v_user_id,
    p_course_id,
    p_lesson_id,
    greatest(0, p_lesson_index),
    100,
    v_quiz_percent,
    'completed',
    v_now,
    v_now,
    v_now
  )
  on conflict (user_id, course_id, lesson_id) do update
  set
    lesson_index = excluded.lesson_index,
    progress_percent = greatest(public.lesson_mastery_progress.progress_percent, excluded.progress_percent),
    quiz_percent = greatest(coalesce(public.lesson_mastery_progress.quiz_percent, 0), excluded.quiz_percent),
    status = 'completed',
    completed_at = coalesce(public.lesson_mastery_progress.completed_at, excluded.completed_at),
    updated_at = now();

  insert into public.knowledge_points (user_id, course_id, lesson_id, source, xp, metadata)
  values (
    v_user_id,
    p_course_id,
    p_lesson_id,
    'lesson_complete',
    25,
    jsonb_build_object('lessonIndex', p_lesson_index)
  )
  on conflict do nothing;

  insert into public.student_activity (
    user_id,
    course_id,
    lesson_id,
    activity_type,
    duration_seconds,
    xp_delta,
    metadata
  )
  values (
    v_user_id,
    p_course_id,
    p_lesson_id,
    'lesson_complete',
    greatest(0, coalesce(p_duration_minutes, 0)) * 60,
    25,
    jsonb_build_object('lessonIndex', p_lesson_index)
  );

  select count(*)
  into v_completed_lessons
  from public.lesson_mastery_progress
  where user_id = v_user_id
    and course_id = p_course_id
    and progress_percent >= 100;

  v_progress := least(
    100,
    round((v_completed_lessons::numeric / greatest(1, coalesce(p_total_lessons, 1))) * 100)::integer
  );

  update public.enrollments
  set
    progress_percent = greatest(progress_percent, v_progress),
    last_lesson_id = p_lesson_id,
    last_accessed_at = v_now,
    completed_at = case
      when v_progress >= 100 then coalesce(completed_at, v_now)
      else completed_at
    end
  where user_id = v_user_id
    and course_id = p_course_id;

  perform private.refresh_leaderboard_snapshot(v_user_id);

  return jsonb_build_object(
    'progressPercent', v_progress,
    'completedLessons', v_completed_lessons,
    'xpAwarded', 25
  );
end;
$$;

grant execute on function public.record_lesson_mastery_progress(text, text, integer, text, integer, integer, integer)
  to authenticated;

create or replace function public.award_quiz_knowledge_points(
  p_course_id text,
  p_lesson_id text,
  p_percent integer,
  p_passed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_user_id uuid := auth.uid();
  v_xp integer := 0;
begin
  if v_user_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if not private.has_enrollment(v_user_id, p_course_id) then
    raise exception 'Course enrollment required' using errcode = '42501';
  end if;

  if p_passed then
    v_xp := 35;

    insert into public.knowledge_points (user_id, course_id, lesson_id, source, xp, metadata)
    values (
      v_user_id,
      p_course_id,
      nullif(p_lesson_id, ''),
      'quiz_pass',
      v_xp,
      jsonb_build_object('percent', p_percent)
    )
    on conflict do nothing;
  end if;

  update public.lesson_mastery_progress
  set
    quiz_percent = greatest(coalesce(quiz_percent, 0), p_percent),
    updated_at = now()
  where user_id = v_user_id
    and course_id = p_course_id
    and lesson_id = nullif(p_lesson_id, '');

  perform private.refresh_leaderboard_snapshot(v_user_id);

  return jsonb_build_object('xpAwarded', v_xp);
end;
$$;

grant execute on function public.award_quiz_knowledge_points(text, text, integer, boolean)
  to authenticated;

drop policy if exists "Students can view course lesson prerequisites" on public.lesson_prerequisites;
create policy "Students can view course lesson prerequisites"
  on public.lesson_prerequisites for select
  to authenticated
  using (is_preview or private.has_enrollment((select auth.uid()), course_id) or private.is_platform_admin());

drop policy if exists "Admins can manage lesson prerequisites" on public.lesson_prerequisites;
create policy "Admins can manage lesson prerequisites"
  on public.lesson_prerequisites for all
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Students can view own mastery progress" on public.lesson_mastery_progress;
create policy "Students can view own mastery progress"
  on public.lesson_mastery_progress for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_platform_admin());

drop policy if exists "Students can insert gated mastery progress" on public.lesson_mastery_progress;
drop policy if exists "Students can update gated mastery progress" on public.lesson_mastery_progress;
drop policy if exists "Admins can manage mastery progress directly" on public.lesson_mastery_progress;
create policy "Admins can manage mastery progress directly"
  on public.lesson_mastery_progress for all
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Users can manage own quiz attempts" on public.quiz_attempts;
drop policy if exists "Students can view own quiz attempts" on public.quiz_attempts;
create policy "Students can view own quiz attempts"
  on public.quiz_attempts for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_platform_admin());

drop policy if exists "Students can view own knowledge points" on public.knowledge_points;
create policy "Students can view own knowledge points"
  on public.knowledge_points for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_platform_admin());

drop policy if exists "Public leaderboard snapshots are readable" on public.leaderboard_snapshots;
create policy "Public leaderboard snapshots are readable"
  on public.leaderboard_snapshots for select
  to authenticated
  using (true);

-- =============================================
-- REALTIME CONTENT UPDATE OUTBOX
-- =============================================

create table if not exists public.course_content_events (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  lesson_id text,
  event_type text not null default 'CONTENT_UPDATE',
  actor_id uuid references public.profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint course_content_events_type_check
    check (event_type in ('CONTENT_UPDATE', 'COURSE_PUBLISHED', 'ASSET_READY', 'ASSET_FAILED'))
);

alter table public.course_content_events enable row level security;

drop policy if exists "Enrolled students can read course content events" on public.course_content_events;
create policy "Enrolled students can read course content events"
  on public.course_content_events for select
  to authenticated
  using (
    private.is_platform_admin()
    or private.has_enrollment((select auth.uid()), course_id)
    or exists (
      select 1 from public.courses c
      where c.id = course_content_events.course_id
        and c.instructor_id = (select auth.uid())
    )
    or exists (
      select 1 from public.course_submissions s
      where s.slug = course_content_events.course_id
        and s.instructor_id = (select auth.uid())
    )
  );

drop policy if exists "Instructors can write course content events" on public.course_content_events;
create policy "Instructors can write course content events"
  on public.course_content_events for insert
  to authenticated
  with check (
    private.is_platform_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_content_events.course_id
        and c.instructor_id = (select auth.uid())
    )
    or exists (
      select 1 from public.course_submissions s
      where s.slug = course_content_events.course_id
        and s.instructor_id = (select auth.uid())
    )
  );

create index if not exists course_content_events_course_created_idx
  on public.course_content_events(course_id, created_at desc);
create index if not exists course_content_events_lesson_created_idx
  on public.course_content_events(course_id, lesson_id, created_at desc);

create or replace function public.emit_course_asset_content_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT'
    or new.storage_path is distinct from old.storage_path
    or new.status is distinct from old.status
    or new.title is distinct from old.title
    or new.analysis is distinct from old.analysis
  then
    insert into public.course_content_events (
      course_id,
      lesson_id,
      event_type,
      actor_id,
      payload
    )
    values (
      new.course_id,
      new.lesson_id,
      case
        when new.status = 'ready' then 'ASSET_READY'
        when new.status = 'failed' then 'ASSET_FAILED'
        else 'CONTENT_UPDATE'
      end,
      new.instructor_id,
      jsonb_build_object(
        'assetId', new.id,
        'assetType', new.asset_type,
        'status', new.status,
        'storageBucket', new.storage_bucket,
        'storagePath', new.storage_path,
        'title', new.title
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists emit_course_asset_content_update on public.course_assets;
create trigger emit_course_asset_content_update
  after insert or update on public.course_assets
  for each row execute procedure public.emit_course_asset_content_update();

do $$
begin
  begin
    alter publication supabase_realtime add table public.course_content_events;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;

-- =============================================
-- DYNAMIC PRICING + PEER REVIEW
-- =============================================

create table if not exists public.dynamic_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,
  item_id text not null,
  title text not null,
  discount_percent integer not null default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dynamic_pricing_item_type_check check (item_type in ('course', 'product')),
  constraint dynamic_pricing_discount_check check (discount_percent between 0 and 95),
  constraint dynamic_pricing_time_check check (ends_at > starts_at)
);

create table if not exists public.peer_review_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  lesson_id text,
  student_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  submission_text text,
  submission_url text,
  review_text text,
  score integer,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint peer_review_status_check check (status in ('submitted', 'assigned', 'reviewed', 'returned')),
  constraint peer_review_score_check check (score is null or score between 0 and 100)
);

alter table public.course_questions
  add column if not exists video_timestamp_seconds integer;

alter table public.dynamic_pricing_rules enable row level security;
alter table public.peer_review_assignments enable row level security;

drop policy if exists "Public active pricing rules are readable" on public.dynamic_pricing_rules;
create policy "Public active pricing rules are readable"
  on public.dynamic_pricing_rules for select
  to anon, authenticated
  using (is_active and now() between starts_at and ends_at);

drop policy if exists "Admins can manage pricing rules" on public.dynamic_pricing_rules;
create policy "Admins can manage pricing rules"
  on public.dynamic_pricing_rules for all
  to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

drop policy if exists "Students can manage own peer submissions" on public.peer_review_assignments;
create policy "Students can manage own peer submissions"
  on public.peer_review_assignments for all
  to authenticated
  using ((select auth.uid()) = student_id)
  with check ((select auth.uid()) = student_id);

drop policy if exists "Reviewers can view assigned peer submissions" on public.peer_review_assignments;
create policy "Reviewers can view assigned peer submissions"
  on public.peer_review_assignments for select
  to authenticated
  using ((select auth.uid()) = reviewer_id or private.is_platform_admin());

drop policy if exists "Reviewers can update assigned peer submissions" on public.peer_review_assignments;
create policy "Reviewers can update assigned peer submissions"
  on public.peer_review_assignments for update
  to authenticated
  using ((select auth.uid()) = reviewer_id or private.is_platform_admin())
  with check ((select auth.uid()) = reviewer_id or private.is_platform_admin());

create index if not exists dynamic_pricing_item_active_idx
  on public.dynamic_pricing_rules(item_type, item_id, is_active, starts_at, ends_at);
create index if not exists peer_review_course_status_idx
  on public.peer_review_assignments(course_id, status, updated_at desc);
create index if not exists peer_review_student_idx
  on public.peer_review_assignments(student_id, submitted_at desc);
create index if not exists peer_review_reviewer_idx
  on public.peer_review_assignments(reviewer_id, status, updated_at desc);
create index if not exists course_questions_timestamp_idx
  on public.course_questions(course_id, lesson_id, video_timestamp_seconds);

create or replace function public.active_pricing_for_item(
  p_item_type text,
  p_item_id text,
  p_base_amount integer
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with best_rule as (
    select *
    from public.dynamic_pricing_rules
    where item_type = p_item_type
      and item_id = p_item_id
      and is_active
      and now() between starts_at and ends_at
    order by discount_percent desc, created_at desc
    limit 1
  )
  select jsonb_build_object(
    'baseAmount', p_base_amount,
    'discountPercent', coalesce((select discount_percent from best_rule), 0),
    'finalAmount',
      round(p_base_amount * (1 - coalesce((select discount_percent from best_rule), 0) / 100.0))::integer,
    'ruleId', (select id from best_rule),
    'title', (select title from best_rule)
  );
$$;

grant execute on function public.active_pricing_for_item(text, text, integer)
  to anon, authenticated, service_role;

-- =============================================
-- FOREIGN KEY / HOT QUERY INDEX SWEEP
-- =============================================

create index if not exists courses_instructor_idx on public.courses(instructor_id);
create index if not exists offline_sessions_center_idx on public.offline_sessions(center_id);
create index if not exists offline_sessions_course_idx on public.offline_sessions(course_id);
create index if not exists enrollments_user_idx on public.enrollments(user_id);
create index if not exists enrollments_course_idx on public.enrollments(course_id);
create index if not exists enrollments_user_course_progress_idx
  on public.enrollments(user_id, course_id, progress_percent, last_accessed_at desc);
create index if not exists certificates_user_idx on public.certificates(user_id);
create index if not exists certificates_course_idx on public.certificates(course_id);
create index if not exists learning_sessions_user_idx on public.learning_sessions(user_id);
create index if not exists learning_sessions_course_idx on public.learning_sessions(course_id);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_item_idx on public.orders(item_type, item_id);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists wishlist_courses_user_idx on public.wishlist_courses(user_id);
create index if not exists user_notes_user_idx on public.user_notes(user_id);
create index if not exists ai_conversations_user_idx on public.ai_conversations(user_id);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts(user_id);
create index if not exists quiz_attempts_course_idx on public.quiz_attempts(course_id);
create index if not exists payment_intents_order_idx on public.payment_intents(order_id);
create index if not exists payment_intents_user_idx on public.payment_intents(user_id);
create index if not exists course_submissions_instructor_idx on public.course_submissions(instructor_id);
create index if not exists course_assets_instructor_idx on public.course_assets(instructor_id);
create index if not exists course_assets_submission_idx on public.course_assets(submission_id);
create index if not exists course_questions_student_idx on public.course_questions(student_id);
create index if not exists course_questions_instructor_idx on public.course_questions(instructor_id);
create index if not exists instructor_payouts_instructor_idx on public.instructor_payouts(instructor_id);
create index if not exists certificate_templates_instructor_idx on public.certificate_templates(instructor_id);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.dynamic_pricing_rules to anon;
revoke insert, update, delete on public.quiz_attempts from anon, authenticated;
revoke insert, update, delete
  on public.student_activity,
     public.lesson_mastery_progress,
     public.knowledge_points,
     public.leaderboard_snapshots
  from authenticated;
grant select
  on public.platform_event_logs,
     public.student_activity,
     public.lesson_prerequisites,
     public.lesson_mastery_progress,
     public.knowledge_points,
     public.leaderboard_snapshots,
     public.course_content_events,
     public.dynamic_pricing_rules,
     public.peer_review_assignments,
     public.quiz_attempts
  to authenticated;
grant select, insert, update, delete on public.lesson_prerequisites to authenticated;
grant select, insert on public.course_content_events to authenticated;
grant select, insert, update, delete
  on public.dynamic_pricing_rules,
     public.peer_review_assignments
  to authenticated;
grant all privileges
  on public.platform_event_logs,
     public.student_activity,
     public.lesson_prerequisites,
     public.lesson_mastery_progress,
     public.knowledge_points,
     public.leaderboard_snapshots,
     public.course_content_events,
     public.dynamic_pricing_rules,
     public.peer_review_assignments
  to service_role;
