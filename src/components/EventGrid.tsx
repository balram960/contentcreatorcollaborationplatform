import { EventCard } from './EventCard';
import type { EventWithCount } from '../lib/supabase';

type Props = {
  events: EventWithCount[];
  onSelect: (id: string) => void;
};

export function EventGrid({ events, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e, i) => (
        <EventCard key={e.id} event={e} onSelect={onSelect} index={i} />
      ))}
    </div>
  );
}
