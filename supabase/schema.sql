-- =============================================
-- Kings Education Platform — Supabase Schema
-- Supabase Dashboard > SQL Editor ga copy qilib run qiling
-- =============================================

-- 1. PROFILES (auth.users ni kengaytiradi)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  avatar_url  text,
  phone       text,
  bio         text,
  company_name text,
  language_pref text not null default 'uz'
    check (language_pref in ('uz', 'ru', 'en')),
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now()
);

-- Yangi foydalanuvchi ro'yxatdan o'tganda avtomatik profil yaratish
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ENROLLMENTS (kurs yozilishlari)
create table if not exists public.enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  course_id         text not null,
  enrolled_at       timestamptz not null default now(),
  progress_percent  int not null default 0 check (progress_percent between 0 and 100),
  last_lesson_id    text,
  last_accessed_at  timestamptz,
  completed_at      timestamptz,
  unique (user_id, course_id)
);

-- 3. CERTIFICATES
create table if not exists public.certificates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   text not null,
  issued_at   timestamptz not null default now(),
  unique (user_id, course_id)
);

-- 4. LEARNING_SESSIONS (o'qish vaqti)
create table if not exists public.learning_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  course_id         text not null,
  lesson_id         text,
  duration_minutes  int not null default 0,
  created_at        timestamptz not null default now()
);

-- 5. ORDERS (buyurtmalar)
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  user_email  text,
  item_id     text not null,
  item_title  text not null,
  item_type   text not null check (item_type in ('course', 'product')),
  amount      int not null,
  payment_method text check (payment_method in ('card', 'payme', 'click')),
  customer_name text,
  customer_phone text,
  status      text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at  timestamptz not null default now()
);

-- 6. CONTACT_MESSAGES (saytdan yuborilgan murojaatlar)
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new', 'in_review', 'resolved')),
  created_at  timestamptz not null default now()
);

-- 7. WISHLIST_COURSES (save for later)
create table if not exists public.wishlist_courses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.site_content (
  content_key   text primary key,
  content_value text not null,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.profiles(id) on delete set null
);

create or replace function public.set_site_content_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
  before update on public.site_content
  for each row execute procedure public.set_site_content_updated_at();

-- =============================================
-- RLS (Row Level Security) siyosatlari
-- =============================================

alter table public.profiles        enable row level security;
alter table public.enrollments     enable row level security;
alter table public.certificates    enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.orders          enable row level security;
alter table public.contact_messages enable row level security;
alter table public.wishlist_courses enable row level security;
alter table public.site_content    enable row level security;

create index if not exists profiles_role_idx
  on public.profiles(role);

create index if not exists orders_user_created_idx
  on public.orders(user_id, created_at desc);

create index if not exists orders_status_created_idx
  on public.orders(status, created_at desc);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);

create index if not exists learning_sessions_user_course_created_idx
  on public.learning_sessions(user_id, course_id, created_at desc);

create index if not exists wishlist_courses_user_created_idx
  on public.wishlist_courses(user_id, created_at desc);

create index if not exists site_content_updated_at_idx
  on public.site_content(updated_at desc);

-- Profiles: foydalanuvchi o'z profilini ko'ra va o'zgartira oladi; admin hammasini ko'ra oladi
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admin can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Enrollments: foydalanuvchi o'z yozilishlarini ko'ra oladi
create policy "Users can view own enrollments"
  on public.enrollments for select using (auth.uid() = user_id);

create policy "Admin can view all enrollments"
  on public.enrollments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can insert own enrollments"
  on public.enrollments for insert with check (auth.uid() = user_id);

create policy "Users can update own enrollments"
  on public.enrollments for update using (auth.uid() = user_id);

-- Certificates: foydalanuvchi o'z sertifikatlarini ko'ra oladi
create policy "Users can view own certificates"
  on public.certificates for select using (auth.uid() = user_id);

create policy "Users can insert own certificates"
  on public.certificates for insert with check (auth.uid() = user_id);

create policy "Admin can view all certificates"
  on public.certificates for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Learning sessions: foydalanuvchi o'z sessiyalarini boshqara oladi
create policy "Users can manage own learning sessions"
  on public.learning_sessions for all using (auth.uid() = user_id);

create policy "Admin can view all learning sessions"
  on public.learning_sessions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Orders: foydalanuvchi o'z buyurtmalarini ko'ra oladi
create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Admin can view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Contact messages: sayt foydalanuvchisi yoki mehmon yubora oladi; admin ko'radi va yangilaydi
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admin can view all contact messages"
  on public.contact_messages for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin can update contact messages"
  on public.contact_messages for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can manage own wishlist"
  on public.wishlist_courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view site content"
  on public.site_content for select
  using (true);

create policy "Admin can insert site content"
  on public.site_content for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin can update site content"
  on public.site_content for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admin can delete site content"
  on public.site_content for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
