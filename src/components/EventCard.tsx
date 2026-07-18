import { CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react';
import type { EventWithCount } from '../lib/supabase';
import { categoryColor, classNames, formatTime, timeUntil } from '../lib/utils';

type Props = {
  event: EventWithCount;
  onSelect: (id: string) => void;
  index?: number;
};

export function EventCard({ event, onSelect, index = 0 }: Props) {
  const c = categoryColor(event.category);
  const spots = Math.max(0, event.capacity - event.registration_count);
  const fillPct = Math.min(100, Math.round((event.registration_count / event.capacity) * 100));
  const t = timeUntil(event.event_date);
  const tone = t.tone === 'soon' ? 'bg-amber-50 text-amber-700 ring-amber-200' : t.tone === 'past' ? 'bg-ink-100 text-ink-500 ring-ink-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200';

  return (
    <button
      onClick={() => onSelect(event.id)}
      style={{ animationDelay: `${index * 60}ms` }}
      className="card group relative flex flex-col overflow-hidden text-left animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative h-44 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={classNames('chip ring-1', c.bg, c.text, c.ring)}>{event.category}</span>
        </div>
        <div className="absolute right-3 top-3">
          <span className={classNames('chip ring-1 bg-white/90 text-ink-800 ring-white/40 backdrop-blur')}>
            {t.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg font-bold text-white drop-shadow-sm line-clamp-2">{event.title}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} />
            {formatTime(event.event_date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} />
            <span className="truncate">{event.venue}</span>
          </span>
        </div>

        <p className="text-sm text-ink-600 line-clamp-2">{event.description ?? 'No description provided.'}</p>

        <div className="mt-auto">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-ink-700">
              <Users size={13} />
              {event.registration_count}/{event.capacity}
            </span>
            <span className={classNames('font-semibold', spots === 0 ? 'text-rose-600' : 'text-emerald-600')}>
              {spots === 0 ? 'Full' : `${spots} spots left`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className={classNames(
                'h-full rounded-full transition-all',
                fillPct >= 100 ? 'bg-rose-400' : fillPct > 70 ? 'bg-amber-400' : 'bg-sky-400',
              )}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className={classNames('chip ring-1', tone)}>{event.status === 'past' ? 'Ended' : 'Open'}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 transition group-hover:gap-2">
            View <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </button>
  );
}
