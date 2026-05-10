-- ====================================================
-- Payment orchestration foundation (Phase 3)
-- ====================================================

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  payment_method text not null,
  status text not null default 'pending_confirmation',
  amount int not null default 0,
  currency text not null default 'UZS',
  provider_reference text,
  checkout_token uuid not null default gen_random_uuid(),
  status_detail text,
  provider_payload jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_intents
  add column if not exists provider text not null default 'card',
  add column if not exists payment_method text not null default 'card',
  add column if not exists status text not null default 'pending_confirmation',
  add column if not exists amount int not null default 0,
  add column if not exists currency text not null default 'UZS',
  add column if not exists provider_reference text,
  add column if not exists checkout_token uuid not null default gen_random_uuid(),
  add column if not exists status_detail text,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb,
  add column if not exists confirmed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.payment_intents
  drop constraint if exists payment_intents_provider_check;

alter table public.payment_intents
  add constraint payment_intents_provider_check
  check (provider in ('card', 'payme', 'click'));

alter table public.payment_intents
  drop constraint if exists payment_intents_payment_method_check;

alter table public.payment_intents
  add constraint payment_intents_payment_method_check
  check (payment_method in ('card', 'payme', 'click'));

alter table public.payment_intents
  drop constraint if exists payment_intents_status_check;

alter table public.payment_intents
  add constraint payment_intents_status_check
  check (
    status in (
      'pending_confirmation',
      'processing',
      'succeeded',
      'failed',
      'cancelled'
    )
  );

create or replace function public.set_payment_intents_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_payment_intents_updated_at on public.payment_intents;
create trigger set_payment_intents_updated_at
  before update on public.payment_intents
  for each row execute procedure public.set_payment_intents_updated_at();

alter table public.orders
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists status_detail text;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'last_payment_intent_id'
  ) then
    alter table public.orders
      add column last_payment_intent_id uuid references public.payment_intents(id) on delete set null;
  end if;
end
$$;

alter table public.payment_intents enable row level security;

drop policy if exists "Users can view own payment intents" on public.payment_intents;
create policy "Users can view own payment intents"
  on public.payment_intents for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own payment intents" on public.payment_intents;
create policy "Users can insert own payment intents"
  on public.payment_intents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all payment intents" on public.payment_intents;
create policy "Admin can view all payment intents"
  on public.payment_intents for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists payment_intents_order_created_idx
  on public.payment_intents(order_id, created_at desc);

create index if not exists payment_intents_user_status_idx
  on public.payment_intents(user_id, status, created_at desc);

create index if not exists payment_intents_provider_reference_idx
  on public.payment_intents(provider_reference);

create or replace function public.confirm_payment_intent(
  p_intent_id uuid,
  p_status text default 'succeeded',
  p_source text default 'manual',
  p_provider_reference text default null,
  p_detail jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role text := auth.role();
  v_profile_role text := null;
  v_intent public.payment_intents%rowtype;
  v_order public.orders%rowtype;
  v_now timestamptz := now();
begin
  if p_status not in ('pending_confirmation', 'processing', 'succeeded', 'failed', 'cancelled') then
    raise exception 'Invalid payment status';
  end if;

  select *
  into v_intent
  from public.payment_intents
  where id = p_intent_id;

  if not found then
    raise exception 'Payment intent not found';
  end if;

  select *
  into v_order
  from public.orders
  where id = v_intent.order_id;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_actor_id is not null then
    select role
    into v_profile_role
    from public.profiles
    where id = v_actor_id;
  end if;

  if not (
    v_actor_id = v_intent.user_id or
    v_profile_role = 'admin' or
    v_actor_role = 'service_role'
  ) then
    raise exception 'Forbidden';
  end if;

  update public.payment_intents
  set
    status = p_status,
    provider_reference = coalesce(p_provider_reference, provider_reference),
    status_detail = p_source,
    provider_payload = coalesce(provider_payload, '{}'::jsonb) || coalesce(p_detail, '{}'::jsonb),
    confirmed_at = case when p_status = 'succeeded' then coalesce(confirmed_at, v_now) else confirmed_at end,
    cancelled_at = case when p_status in ('failed', 'cancelled') then v_now else cancelled_at end,
    updated_at = v_now
  where id = v_intent.id;

  if p_status = 'succeeded' then
    update public.orders
    set
      status = 'paid',
      payment_reference = coalesce(p_provider_reference, payment_reference),
      paid_at = coalesce(paid_at, v_now),
      fulfilled_at = coalesce(fulfilled_at, v_now),
      status_detail = concat('confirmed:', p_source),
      last_payment_intent_id = v_intent.id
    where id = v_order.id;

    if v_order.item_type = 'course' and v_order.item_id is not null then
      insert into public.enrollments (user_id, course_id, progress_percent)
      values (v_order.user_id, v_order.item_id, 0)
      on conflict (user_id, course_id) do nothing;
    end if;
  elsif p_status = 'cancelled' then
    update public.orders
    set
      status = 'cancelled',
      status_detail = concat('cancelled:', p_source),
      last_payment_intent_id = v_intent.id
    where id = v_order.id;
  else
    update public.orders
    set
      status = 'pending',
      status_detail = concat('awaiting:', p_source),
      last_payment_intent_id = v_intent.id
    where id = v_order.id;
  end if;

  return jsonb_build_object(
    'order_id', v_order.id,
    'payment_intent_id', v_intent.id,
    'order_status',
      case
        when p_status = 'succeeded' then 'paid'
        when p_status = 'cancelled' then 'cancelled'
        else 'pending'
      end,
    'payment_status', p_status
  );
end;
$$;

revoke all on function public.confirm_payment_intent(uuid, text, text, text, jsonb) from public;
grant execute on function public.confirm_payment_intent(uuid, text, text, text, jsonb) to authenticated;
grant execute on function public.confirm_payment_intent(uuid, text, text, text, jsonb) to service_role;
