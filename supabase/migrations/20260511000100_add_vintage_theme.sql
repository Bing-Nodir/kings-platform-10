alter table if exists public.user_preferences
  drop constraint if exists user_preferences_theme_pref_check;

alter table if exists public.user_preferences
  add constraint user_preferences_theme_pref_check
  check (theme_pref in ('light', 'dark', 'midnight', 'vintage', 'system'));
