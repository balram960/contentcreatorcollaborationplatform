import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Missing Supabase env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'festgo.auth',
  },
});

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  venue: string;
  event_date: string;
  capacity: number;
  image_url: string | null;
  created_at: string;
  created_by: string | null;
};

export type RegistrationRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  participant_name: string;
  participant_email: string;
  participant_phone: string | null;
  college: string | null;
  team_name: string | null;
  status: string;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
};

export type EventWithCount = EventRow & {
  registration_count: number;
};

export const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Other'] as const;
export type Category = typeof CATEGORIES[number];
