/*
# FESTGO Auth — profiles, ownership, admin role

## Overview
Adds user accounts to FESTGO via Supabase email/password auth. Creates a
`profiles` table mirroring `auth.users`, marks the first-ever user as admin,
restricts event writes to admins, and scopes registrations to their owner.

## 1. New Tables

### profiles
- `id` (uuid, PK, FK -> auth.users.id ON DELETE CASCADE)
- `email` (text, not null)
- `full_name` (text)
- `is_admin` (boolean, default false)
- `created_at` (timestamptz, default now())

## 2. Modified Tables

### registrations
- Adds `user_id uuid` (nullable for legacy rows) FK -> auth.users.id ON DELETE SET NULL.
- Index on `user_id` for fast per-user queries.

### events
- Adds `created_by uuid` FK -> auth.users.id ON DELETE SET NULL (audit/ownership).

## 3. Security — RLS policy rewrites

### events
- SELECT: public (anon + authenticated).
- INSERT / UPDATE / DELETE: authenticated admins only (`is_admin = true` on profiles).

### registrations
- SELECT: owner sees own rows; admins see all.
- INSERT: authenticated, must own the row (`auth.uid() = user_id`).
- UPDATE / DELETE: owner or admin.

### settings
- SELECT: public (anon + authenticated) — needed for the admin passcode fallback.
- UPDATE / DELETE: admins only.

### profiles
- SELECT: authenticated users can read all profiles (needed to show participant names in admin views).
- UPDATE: a user can update only their own profile row.
- INSERT: a user can insert only their own profile row.

## 4. Automation

### handle_new_user() trigger
- On `auth.users` INSERT, creates a matching `profiles` row.
- The FIRST user to sign up (profiles table empty) gets `is_admin = true`.
- Subsequent users get `is_admin = false`.
- Attached as `on_auth_user_created` AFTER INSERT trigger on `auth.users`.

## 5. Important Notes
1. `user_id` on registrations is nullable so existing seed data and any
   pre-auth rows are preserved. New registrations from the UI set `user_id`
   to the current user.
2. The first user to sign up becomes the admin. If you need to promote
   another user later, set `profiles.is_admin = true` in SQL.
3. Email confirmation stays OFF — signups can log in immediately.
4. Policies use `DROP POLICY IF EXISTS` first so this migration is idempotent.
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_authenticated" ON profiles;
CREATE POLICY "profiles_read_authenticated" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- registrations: add user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);

-- events: add created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- events policies: admin-only writes
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_events" ON events;
CREATE POLICY "anon_read_events" ON events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_events" ON events;
CREATE POLICY "admin_insert_events" ON events FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "admin_update_events" ON events;
CREATE POLICY "admin_update_events" ON events FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "admin_delete_events" ON events;
CREATE POLICY "admin_delete_events" ON events FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Drop the old permissive write policies
DROP POLICY IF EXISTS "anon_insert_events" ON events;
DROP POLICY IF EXISTS "anon_update_events" ON events;
DROP POLICY IF EXISTS "anon_delete_events" ON events;

-- registrations policies: owner-scoped
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_registrations" ON registrations;
DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
DROP POLICY IF EXISTS "anon_update_registrations" ON registrations;
DROP POLICY IF EXISTS "anon_delete_registrations" ON registrations;

DROP POLICY IF EXISTS "registrations_select" ON registrations;
CREATE POLICY "registrations_select" ON registrations FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "registrations_insert" ON registrations;
CREATE POLICY "registrations_insert" ON registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "registrations_update" ON registrations;
CREATE POLICY "registrations_update" ON registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "registrations_delete" ON registrations;
CREATE POLICY "registrations_delete" ON registrations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- settings: admin-only writes
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_settings" ON settings;
CREATE POLICY "anon_read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "anon_update_settings" ON settings;

-- handle_new_user function (idempotent via OR REPLACE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first boolean;
BEGIN
  SELECT (count(*) = 0) INTO is_first FROM profiles;
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    is_first
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
