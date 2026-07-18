import { useCallback, useEffect, useState } from 'react';
import { supabase, type RegistrationRow } from '../lib/supabase';

export function useRegistrations(eventId: string | null) {
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setRegistrations((data as RegistrationRow[]) ?? []);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { registrations, loading, error, refetch };
}
