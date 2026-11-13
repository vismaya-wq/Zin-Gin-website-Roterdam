# Supabase setup (Zin & Gin)

## 1. Create project

Create a Supabase project and copy **Project URL** and **anon public key**.

## 2. Run migration

In the Supabase SQL editor, run:

`supabase/migrations/001_core_schema.sql`

## 3. Environment variables

Copy `.env.example` to `.env` and set:

- `PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`

Add the same variables in **Netlify → Site settings → Environment variables**.

Never put the **service role** key in frontend code or `PUBLIC_*` variables.

## 4. Create admin users (manual)

1. Supabase Dashboard → **Authentication → Users → Add user** (email + password).
2. Copy the user UUID.
3. SQL editor:

```sql
insert into public.profiles (id, email, full_name, role, active)
values (
  'USER-UUID-HERE',
  'owner@zinandgin.nl',
  'Restaurant Owner',
  'owner',
  true
);
```

Repeat for `manager` and `worker` roles as needed.

## 5. Seed menu content (optional)

Run locally with service role (one-off):

```bash
node scripts/seed-supabase-menu.mjs
```

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment.

## 6. Admin URL

Staff use **`/admin`** only (not linked from the public site). Auth is enforced with Supabase session + RLS.

## Roles

| Role    | Reservations | CMS (menu, events, gallery) |
|---------|--------------|-------------------------------|
| owner   | Full         | Full                          |
| manager | View/update  | No                            |
| worker  | View only    | No                            |

Food orders stay on **BonAppio** (takeaway) and **Uber Eats** (delivery) — not stored in Supabase.
