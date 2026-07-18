/*
# FESTGO - College Fest Management System Schema

## Overview
Creates the core tables for FESTGO: events, registrations, and a simple admin marker.
This is a single-tenant public app (no sign-in screen) — students browse events and
register as participants; admins manage events. Access is gated in the UI by an admin
passcode stored in a settings table.

## 1. New Tables

### events
- `id` (uuid, primary key)
- `title` (text, not null) — event name
- `description` (text) — long-form details
- `category` (text) — e.g. Technical, Cultural, Sports, Workshop
- `venue` (text) — location
- `event_date` (timestamptz) — when the event takes place
- `capacity` (int, default 100) — max participants
- `image_url` (text) — optional cover image
- `created_at` (timestamptz, default now())

### registrations
- `id` (uuid, primary key)
- `event_id` (uuid, FK -> events.id ON DELETE CASCADE)
- `participant_name` (text, not null)
- `participant_email` (text, not null)
- `participant_phone` (text)
- `college` (text)
- `team_name` (text) — optional, for team events
- `status` (text, default 'registered') — registered | checked_in | cancelled
- `created_at` (timestamptz, default now())
- Unique constraint on (event_id, participant_email) to prevent duplicate registrations

### settings
- `key` (text, primary key) — single-row config store
- `value` (text)
- Used to store the admin passcode (key = 'admin_passcode').

## 2. Security
- RLS enabled on all tables.
- All tables allow anon + authenticated CRUD because this is a public/shared app
  with no sign-in screen. Admin gating is enforced in the UI via a passcode.
- `USING (true)` is intentional and documented: all data is public to app users.

## 3. Important Notes
1. No `user_id` / `auth.users` linkage — app has no sign-in.
2. Unique constraint prevents a participant from registering twice for the same event.
3. Cascade delete on event removes its registrations.
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Technical',
  venue text NOT NULL DEFAULT 'TBD',
  event_date timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  capacity int NOT NULL DEFAULT 100,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_email text NOT NULL,
  participant_phone text,
  college text,
  team_name text,
  status text NOT NULL DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, participant_email)
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text
);

-- Seed default admin passcode if not present
INSERT INTO settings (key, value)
VALUES ('admin_passcode', 'festgo-admin-2026')
ON CONFLICT (key) DO NOTHING;

-- Seed a few sample events
INSERT INTO events (title, description, category, venue, event_date, capacity, image_url)
VALUES
  ('Hackathon 2026', 'A 24-hour coding marathon where teams build innovative solutions to real-world problems. Prizes for top 3 teams.', 'Technical', 'Main Auditorium', now() + interval '10 days', 120, 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Dance Battle', 'Inter-college dance competition. Solo and group categories. Bring your best moves!', 'Cultural', 'Open Air Stage', now() + interval '5 days', 80, 'https://images.pexels.com/photos/4649105/pexels-photo-4649105.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Robo Wars', 'Build and battle robots in a knockout tournament. Engineering departments only.', 'Technical', 'Tech Park', now() + interval '14 days', 32, 'https://images.pexels.com/photos/2599538/pexels-photo-2599538.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Photography Workshop', 'Learn composition, lighting, and editing from award-winning photographers.', 'Workshop', 'Seminar Hall B', now() + interval '3 days', 50, 'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Football Championship', '8-a-side knockout football tournament. Register your college team.', 'Sports', 'Sports Ground', now() + interval '21 days', 96, 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200')
ON CONFLICT DO NOTHING;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_events" ON events;
CREATE POLICY "anon_read_events" ON events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_events" ON events;
CREATE POLICY "anon_insert_events" ON events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_events" ON events;
CREATE POLICY "anon_update_events" ON events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_events" ON events;
CREATE POLICY "anon_delete_events" ON events FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_registrations" ON registrations;
CREATE POLICY "anon_read_registrations" ON registrations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registrations" ON registrations;
CREATE POLICY "anon_update_registrations" ON registrations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registrations" ON registrations;
CREATE POLICY "anon_delete_registrations" ON registrations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_settings" ON settings;
CREATE POLICY "anon_read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
