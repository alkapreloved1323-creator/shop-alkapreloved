# Phase 2 — Supabase Setup

## Apply the migration

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Copy the service role key into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.
4. Run the migration through Supabase CLI or SQL Editor:

```powershell
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migration is [`001_initial_schema.sql`](file:///d:/BIG/alkapreloved/supabase/migrations/001_initial_schema.sql).

## Admin/staff authorization

Admin authorization uses Supabase Auth `app_metadata.role`:

```json
{ "role": "admin" }
```

or:

```json
{ "role": "staff" }
```

Set this metadata only through a trusted server-side process or Supabase dashboard. Do not accept role changes from the browser.

## Security behavior

- Public users can read active catalog records only.
- Orders, order items, payments, shipments, and webhook events have no public read policy.
- Guest order tracking must query through a server-side route that verifies order number plus phone/email.
- Inventory uses atomic PostgreSQL functions to prevent overselling.
- Product images use the `product-images` public bucket; upload/update/delete requires admin/staff authorization.

## Vercel environment variables

Configure the same values from `.env.example` in Vercel Project Settings. Never add `SUPABASE_SERVICE_ROLE_KEY` to a `NEXT_PUBLIC_*` variable.
