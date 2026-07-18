import { useCallback, useEffect, useState } from 'react';
import { supabase, type RegistrationRow } from '../lib/supabase';

export type MyRegistration = RegistrationRow & {
  events: { id: string; title: string; event_date: string; venue: string; image_url: string | null } | null;
};

export function useMyRegistrations() {
  const [items, setItems] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(id, title, event_date, venue, image_url)')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data as MyRegistration[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
