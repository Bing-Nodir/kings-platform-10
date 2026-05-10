-- ====================================================
-- Kings Education Platform - Full Project Alignment
-- Existing projectlar uchun safe repair + fresh setup
-- Supabase SQL Editor ga to'liq copy-paste qilib run qiling
-- ====================================================

create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES
-- =============================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  phone text,
  bio text,
  company_name text,
  language_pref text not null default 'uz',
  role text not null default 'student',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists company_name text,
  add column if not exists language_pref text not null default 'uz',
  add column if not exists role text not null default 'student',
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_language_pref_check;

alter table public.profiles
  add constraint profiles_language_pref_check
  check (language_pref in ('uz', 'ru', 'en'));

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'instructor', 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name, email)
select
  u.id,
  u.raw_user_meta_data->>'full_name',
  u.email
from auth.users u
on conflict (id) do update
set email = excluded.email;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists profiles_role_idx
  on public.profiles(role);

create index if not exists profiles_email_idx
  on public.profiles(email);

-- =============================================
-- OPTIONAL PUBLIC TABLES
-- =============================================

create table if not exists public.courses (
  id text primary key,
  instructor_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  price integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  title text not null,
  description text,
  price integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.offline_centers (
  id uuid primary key default gen_random_uuid(),
  name text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.offline_sessions (
  id uuid primary key default gen_random_uuid(),
  center_id uuid references public.offline_centers(id) on delete cascade,
  course_id text,
  session_date timestamptz,
  qr_code text,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.products enable row level security;
alter table public.offline_centers enable row level security;
alter table public.offline_sessions enable row level security;

drop policy if exists "Anyone can view courses" on public.courses;
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

drop policy if exists "Admin can manage courses" on public.courses;
create policy "Admin can manage courses"
  on public.courses for all
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

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products"
  on public.products for select
  using (true);

drop policy if exists "Admin can manage products" on public.products;
create policy "Admin can manage products"
  on public.products for all
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

drop policy if exists "Anyone can view centers" on public.offline_centers;
create policy "Anyone can view centers"
  on public.offline_centers for select
  using (true);

drop policy if exists "Admin can manage centers" on public.offline_centers;
create policy "Admin can manage centers"
  on public.offline_centers for all
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

drop policy if exists "Anyone can view sessions" on public.offline_sessions;
create policy "Anyone can view sessions"
  on public.offline_sessions for select
  using (true);

drop policy if exists "Admin can manage sessions" on public.offline_sessions;
create policy "Admin can manage sessions"
  on public.offline_sessions for all
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

-- =============================================
-- CORE LEARNING TABLES
-- =============================================

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  enrolled_at timestamptz not null default now(),
  progress_percent int not null default 0,
  last_lesson_id text,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  unique (user_id, course_id)
);

alter table public.enrollments
  add column if not exists last_lesson_id text,
  add column if not exists last_accessed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists progress_percent int not null default 0,
  add column if not exists enrolled_at timestamptz not null default now();

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  lesson_id text,
  duration_minutes int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.learning_sessions
  add column if not exists lesson_id text,
  add column if not exists duration_minutes int not null default 0;

alter table public.enrollments enable row level security;
alter table public.certificates enable row level security;
alter table public.learning_sessions enable row level security;

drop policy if exists "Users can view own enrollments" on public.enrollments;
create policy "Users can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own enrollments" on public.enrollments;
create policy "Users can insert own enrollments"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own enrollments" on public.enrollments;
create policy "Users can update own enrollments"
  on public.enrollments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all enrollments" on public.enrollments;
create policy "Admin can view all enrollments"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Users can view own certificates" on public.certificates;
create policy "Users can view own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own certificates" on public.certificates;
create policy "Users can insert own certificates"
  on public.certificates for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all certificates" on public.certificates;
create policy "Admin can view all certificates"
  on public.certificates for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Users can manage own learning sessions" on public.learning_sessions;
create policy "Users can manage own learning sessions"
  on public.learning_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all learning sessions" on public.learning_sessions;
create policy "Admin can view all learning sessions"
  on public.learning_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists learning_sessions_user_course_created_idx
  on public.learning_sessions(user_id, course_id, created_at desc);

-- =============================================
-- ORDERS + CONTACT
-- =============================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  user_email text,
  item_id text,
  item_title text,
  item_type text,
  amount int,
  payment_method text,
  customer_name text,
  customer_phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists user_email text,
  add column if not exists item_id text,
  add column if not exists item_title text,
  add column if not exists item_type text,
  add column if not exists amount int,
  add column if not exists payment_method text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists status text not null default 'pending',
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'course_id'
  ) then
    execute $sql$
      update public.orders
      set
        item_id = coalesce(item_id, course_id::text),
        item_type = coalesce(
          item_type,
          case when course_id is not null then 'course' else item_type end
        )
      where item_id is null or item_type is null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'product_id'
  ) then
    execute $sql$
      update public.orders
      set
        item_id = coalesce(item_id, product_id::text),
        item_type = coalesce(
          item_type,
          case when product_id is not null then 'product' else item_type end
        )
      where item_id is null or item_type is null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'total_price'
  ) then
    execute $sql$
      update public.orders
      set amount = coalesce(amount, round(total_price)::int)
      where amount is null and total_price is not null
    $sql$;
  end if;
end
$$;

update public.orders o
set user_email = p.email
from public.profiles p
where o.user_id = p.id
  and (o.user_email is null or o.user_email = '');

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'cancelled'));

alter table public.orders
  drop constraint if exists orders_item_type_check;

alter table public.orders
  add constraint orders_item_type_check
  check (
    item_type is null or item_type in ('course', 'product')
  );

alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (
    payment_method is null or payment_method in ('card', 'payme', 'click')
  );

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.contact_messages
  add column if not exists status text not null default 'new',
  add column if not exists created_at timestamptz not null default now();

alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;

alter table public.contact_messages
  add constraint contact_messages_status_check
  check (status in ('new', 'in_review', 'resolved'));

alter table public.orders enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Admin can view all orders" on public.orders;
create policy "Admin can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admin can view all contact messages" on public.contact_messages;
create policy "Admin can view all contact messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admin can update contact messages" on public.contact_messages;
create policy "Admin can update contact messages"
  on public.contact_messages for update
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

create index if not exists orders_user_created_idx
  on public.orders(user_id, created_at desc);

create index if not exists orders_status_created_idx
  on public.orders(status, created_at desc);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);

-- =============================================
-- WISHLIST + NOTES + AI + QUIZ + SITE CONTENT
-- =============================================

create table if not exists public.wishlist_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  messages jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  score int not null default 0,
  total int not null default 0,
  percent int not null default 0,
  passed boolean not null default false,
  answers jsonb not null default '[]',
  completed_at timestamptz not null default now()
);

create table if not exists public.site_content (
  content_key text primary key,
  content_value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
  before update on public.site_content
  for each row execute procedure public.set_site_content_updated_at();

alter table public.wishlist_courses enable row level security;
alter table public.user_notes enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Users can manage own wishlist" on public.wishlist_courses;
create policy "Users can manage own wishlist"
  on public.wishlist_courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own notes" on public.user_notes;
create policy "Users can manage own notes"
  on public.user_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own ai conversations" on public.ai_conversations;
create policy "Users can manage own ai conversations"
  on public.ai_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own quiz attempts" on public.quiz_attempts;
create policy "Users can manage own quiz attempts"
  on public.quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin can view all quiz attempts" on public.quiz_attempts;
create policy "Admin can view all quiz attempts"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Public can view site content" on public.site_content;
create policy "Public can view site content"
  on public.site_content for select
  using (true);

drop policy if exists "Admin can insert site content" on public.site_content;
create policy "Admin can insert site content"
  on public.site_content for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admin can update site content" on public.site_content;
create policy "Admin can update site content"
  on public.site_content for update
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

drop policy if exists "Admin can delete site content" on public.site_content;
create policy "Admin can delete site content"
  on public.site_content for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists wishlist_courses_user_created_idx
  on public.wishlist_courses(user_id, created_at desc);

create index if not exists quiz_attempts_user_course_idx
  on public.quiz_attempts(user_id, course_id);

create index if not exists site_content_updated_at_idx
  on public.site_content(updated_at desc);

-- =============================================
-- LEGACY TABLE REPAIR
-- =============================================

do $$
begin
  if exists (
    select 1
    from pg_tables
    where schemaname = 'public' and tablename = 'table_name'
  ) then
    execute 'alter table public.table_name enable row level security';
  end if;
exception
  when others then
    raise notice 'public.table_name RLS repair skipped: %', sqlerrm;
end
$$;

-- =============================================
-- ADMIN USER
-- =============================================

update public.profiles
set role = 'admin'
where lower(email) = 'nodirkhudayarov@gmail.com';
