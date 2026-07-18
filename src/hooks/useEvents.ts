import { useCallback, useEffect, useState } from 'react';
import { supabase, type EventRow, type EventWithCount } from '../lib/supabase';

export function useEvents() {
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('events')
      .select('*, registrations(count)')
      .order('event_date', { ascending: true });
    if (error) {
      setError(error.message);
    } else if (data) {
      const mapped: EventWithCount[] = (data as unknown as (EventRow & { registrations: { count: number }[] })[]).map(
        (e) => ({
          ...e,
          registration_count: e.registrations?.[0]?.count ?? 0,
        }),
      );
      setEvents(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useEvent(id: string | null) {
  const [event, setEvent] = useState<EventWithCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) {
      setEvent(null);
      return;
    }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('id', id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        setError(error.message);
        setEvent(null);
      } else if (data) {
        const d = data as unknown as EventRow & { registrations: { count: number }[] };
        setEvent({
          ...d,
          registration_count: d.registrations?.[0]?.count ?? 0,
        });
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return { event, loading, error };
}
