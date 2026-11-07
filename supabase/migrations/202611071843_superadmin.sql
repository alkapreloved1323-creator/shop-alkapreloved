-- The protected superadmin account is provisioned server-side, not from the browser.
-- Email: alkapreloved1323@gmail.com
-- Set app_metadata.role = 'superadmin' when creating or updating this Auth user.
-- Keep the password only in Supabase Auth; never store it in the database or source code.

-- Superadmin must retain the same RLS access as admin and staff.
create or replace function public.is_admin_or_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('superadmin', 'admin', 'staff'), false);
$$;
revoke all on function public.is_admin_or_staff() from public;
grant execute on function public.is_admin_or_staff() to authenticated;
