create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid()
);

alter table public.contact_messages
  add column if not exists source text not null default 'contact_form',
  add column if not exists category text not null default 'general',
  add column if not exists related_order_id uuid references public.orders(id) on delete set null,
  add column if not exists resolution_note text,
  add column if not exists resolved_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.contact_messages
set
  source = coalesce(source, 'contact_form'),
  category = coalesce(category, 'general'),
  updated_at = coalesce(updated_at, created_at, now())
where
  source is null
  or category is null
  or updated_at is null;

alter table public.contact_messages
  drop constraint if exists contact_messages_source_check;

alter table public.contact_messages
  add constraint contact_messages_source_check
  check (source in ('contact_form', 'settings_support', 'billing_support'));

alter table public.contact_messages
  drop constraint if exists contact_messages_category_check;

alter table public.contact_messages
  add constraint contact_messages_category_check
  check (category in ('general', 'billing', 'receipt', 'technical', 'account', 'access', 'content'));

create or replace function public.set_contact_messages_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at
  before update on public.contact_messages
  for each row execute procedure public.set_contact_messages_updated_at();

drop policy if exists "Users can view own contact messages" on public.contact_messages;
create policy "Users can view own contact messages"
  on public.contact_messages for select
  using (auth.uid() = user_id);

create index if not exists contact_messages_user_created_idx
  on public.contact_messages(user_id, created_at desc);

create index if not exists contact_messages_source_status_created_idx
  on public.contact_messages(source, status, created_at desc);

create index if not exists contact_messages_related_order_idx
  on public.contact_messages(related_order_id, created_at desc);
