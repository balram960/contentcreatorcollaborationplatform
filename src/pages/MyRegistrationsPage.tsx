import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Ticket, Trash2, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useMyRegistrations } from '../hooks/useMyRegistrations';
import { supabase } from '../lib/supabase';
import { classNames, formatDateTime, timeUntil } from '../lib/utils';
import { Modal } from '../components/Modal';

export function MyRegistrationsPage() {
  const { items, loading, error, refetch } = useMyRegistrations();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const cancel = async (id: string) => {
    setConfirmId(null);
    await supabase.from('registrations').delete().eq('id', id);
    refetch();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">My Registrations</h1>
        <p className="mt-1 text-sm text-ink-500">Events you have registered for.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card h-48 animate-pulse" />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <Inbox size={22} />
          </div>
          <h3 className="font-display text-base font-semibold text-ink-800">No registrations yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-500">Browse events and register to see them here.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            <Ticket size={16} /> Browse events
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r, i) => {
            const ev = r.events;
            const t = ev ? timeUntil(ev.event_date) : null;
            return (
              <div
                key={r.id}
                style={{ animationDelay: `${i * 50}ms` }}
                className="card flex flex-col gap-4 p-4 animate-fade-up sm:flex-row sm:items-center"
              >
                <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:block">
                  {ev?.image_url ? (
                    <img src={ev.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-ink-100" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => ev && navigate(`/event/${ev.id}`)}
                    className="truncate font-display text-sm font-bold text-ink-900 hover:text-sky-600"
                  >
                    {ev?.title ?? 'Event'}
                  </button>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    {ev && (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} /> {formatDateTime(ev.event_date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {ev.venue}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={classNames(
                      'chip ring-1',
                      r.status === 'checked_in'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : r.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 ring-rose-200'
                          : 'bg-sky-50 text-sky-700 ring-sky-200',
                    )}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                  {t && t.tone !== 'past' && r.status !== 'cancelled' && (
                    <button
                      onClick={() => setConfirmId(r.id)}
                      className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Cancel registration"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Cancel registration?" maxWidth="max-w-sm">
        <div className="p-5">
          <p className="text-sm text-ink-600">
            This will remove your registration for this event. You can re-register later if spots are available.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setConfirmId(null)} className="btn-ghost">Keep it</button>
            <button
              onClick={() => confirmId && cancel(confirmId)}
              className="btn bg-rose-600 text-white hover:bg-rose-500"
            >
              <Trash2 size={16} /> Cancel registration
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
