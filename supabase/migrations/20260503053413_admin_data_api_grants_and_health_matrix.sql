-- ====================================================
-- Admin Data API grants and live health matrix support
-- Keeps Supabase REST visibility aligned with RLS-protected tables.
-- ====================================================

grant usage on schema public to anon, authenticated, service_role;

-- Supabase projects created with stricter Data API defaults may require
-- explicit grants before PostgREST can see tables in the schema cache.
-- RLS policies remain the row-level security boundary.
grant select on table
  public.profiles,
  public.site_content,
  public.site_documents,
  public.courses,
  public.products,
  public.offline_centers,
  public.offline_sessions,
  public.payment_intents
to anon;

grant insert on table public.contact_messages to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant all privileges on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
