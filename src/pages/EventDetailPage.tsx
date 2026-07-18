import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Users,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { supabase, type RegistrationRow } from '../lib/supabase';
import { useEvent } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import { categoryColor, classNames, formatDateTime, timeUntil } from '../lib/utils';
import { Modal } from '../components/Modal';

type Props = {
  eventId: string;
};

export function EventDetailPage({ eventId }: Props) {
  const { event, loading, error } = useEvent(eventId);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState<RegistrationRow | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="card h-72 animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <button onClick={() => navigate('/')} className="btn-ghost mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <AlertCircle size={28} className="mb-3 text-rose-500" />
          <h3 className="font-display text-lg font-bold text-ink-900">Event not found</h3>
          <p className="mt-1 text-sm text-ink-500">{error ?? 'The event you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const c = categoryColor(event.category);
  const spots = Math.max(0, event.capacity - event.registration_count);
  const fillPct = Math.min(100, Math.round((event.registration_count / event.capacity) * 100));
  const t = timeUntil(event.event_date);
  const isFull = spots === 0;
  const isPast = t.tone === 'past';
  const canRegister = !!user;

  const onRegisterClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/event/${eventId}` } });
      return;
    }
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/')} className="btn-ghost mb-5 -ml-2">
        <ArrowLeft size={16} /> Back to events
      </button>

      <div className="card overflow-hidden animate-fade-up">
        <div className="relative h-64 sm:h-80">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className={classNames('chip ring-1', c.bg, c.text, c.ring)}>{event.category}</span>
              <span
                className={classNames(
                  'chip ring-1',
                  t.tone === 'soon'
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : t.tone === 'past'
                      ? 'bg-ink-100 text-ink-500 ring-ink-200'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                )}
              >
                {t.label}
              </span>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white drop-shadow-sm sm:text-3xl text-balance">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-ink-900">About this event</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {event.description ?? 'No description provided.'}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={<CalendarDays size={16} />} label="Date & Time" value={formatDateTime(event.event_date)} />
              <InfoRow icon={<MapPin size={16} />} label="Venue" value={event.venue} />
              <InfoRow icon={<Users size={16} />} label="Capacity" value={`${event.capacity} participants`} />
              <InfoRow icon={<Clock size={16} />} label="Status" value={isPast ? 'Event ended' : isFull ? 'Full' : 'Open for registration'} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-ink-100 bg-ink-50/60 p-5">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-500">
                <span>Registrations</span>
                <span>{event.registration_count}/{event.capacity}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200">
                <div
                  className={classNames(
                    'h-full rounded-full transition-all',
                    fillPct >= 100 ? 'bg-rose-400' : fillPct > 70 ? 'bg-amber-400' : 'bg-sky-400',
                  )}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <p className={classNames('mt-2 text-sm font-semibold', spots === 0 ? 'text-rose-600' : 'text-emerald-600')}>
                {spots === 0 ? 'Event is full' : `${spots} spots remaining`}
              </p>

              <button
                disabled={isFull || isPast}
                onClick={onRegisterClick}
                className="btn-primary mt-4 w-full"
              >
                {!user ? <Lock size={16} /> : <Ticket size={16} />}
                {isPast ? 'Event ended' : isFull ? 'Sold out' : user ? 'Register now' : 'Sign in to register'}
              </button>

              <p className="mt-3 text-center text-xs text-ink-500">
                {user
                  ? `Signed in as ${profile?.full_name || user.email?.split('@')[0]}`
                  : 'Free registration · Sign in required'}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <RegisterModal
        open={open}
        onClose={() => setOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        userId={user!.id}
        defaultName={profile?.full_name || ''}
        defaultEmail={user!.email || ''}
        onRegistered={(r) => {
          setRegistered(r);
          setOpen(false);
        }}
      />

      {registered && (
        <SuccessToast name={registered.participant_name} onDismiss={() => setRegistered(null)} />
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-3.5">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</div>
        <div className="text-sm font-semibold text-ink-900">{value}</div>
      </div>
    </div>
  );
}

function RegisterModal({
  open,
  onClose,
  eventId,
  eventTitle,
  userId,
  defaultName,
  defaultEmail,
  onRegistered,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  userId: string;
  defaultName: string;
  defaultEmail: string;
  onRegistered: (r: RegistrationRow) => void;
}) {
  const [form, setForm] = useState({
    participant_name: '',
    participant_email: '',
    participant_phone: '',
    college: '',
    team_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErr(null);
      setSubmitting(false);
      setForm((f) => ({
        ...f,
        participant_name: defaultName || f.participant_name,
        participant_email: defaultEmail || f.participant_email,
      }));
    }
  }, [open, defaultName, defaultEmail]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.participant_name.trim() || !form.participant_email.trim()) {
      setErr('Name and email are required.');
      return;
    }
    setSubmitting(true);
    const payload = {
      event_id: eventId,
      user_id: userId,
      participant_name: form.participant_name.trim(),
      participant_email: form.participant_email.trim().toLowerCase(),
      participant_phone: form.participant_phone.trim() || null,
      college: form.college.trim() || null,
      team_name: form.team_name.trim() || null,
      status: 'registered',
    };
    const { data, error } = await supabase
      .from('registrations')
      .insert(payload)
      .select()
      .maybeSingle();
    setSubmitting(false);
    if (error) {
      if (error.code === '23505') {
        setErr('You have already registered for this event with that email.');
      } else {
        setErr(error.message);
      }
      return;
    }
    if (data) {
      onRegistered(data as RegistrationRow);
      setForm({ participant_name: '', participant_email: '', participant_phone: '', college: '', team_name: '' });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Register · ${eventTitle}`} maxWidth="max-w-md">
      <form onSubmit={submit} className="space-y-4 p-5">
        <div>
          <label className="label">Full name *</label>
          <input
            className="input"
            value={form.participant_name}
            onChange={(e) => setForm({ ...form, participant_name: e.target.value })}
            placeholder="e.g. Aisha Khan"
            autoFocus
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            className="input"
            value={form.participant_email}
            onChange={(e) => setForm({ ...form, participant_email: e.target.value })}
            placeholder="you@college.edu"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.participant_phone}
              onChange={(e) => setForm({ ...form, participant_phone: e.target.value })}
              placeholder="+91 ..."
            />
          </div>
          <div>
            <label className="label">College</label>
            <input
              className="input"
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              placeholder="Your college"
            />
          </div>
        </div>
        <div>
          <label className="label">Team name (optional)</label>
          <input
            className="input"
            value={form.team_name}
            onChange={(e) => setForm({ ...form, team_name: e.target.value })}
            placeholder="For team events"
          />
        </div>

        {err && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-accent">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
            {submitting ? 'Registering...' : 'Confirm registration'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SuccessToast({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-glow">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold text-ink-900">Registration confirmed, {name.split(' ')[0]}!</div>
          <div className="text-xs text-ink-500">Check your email for event details.</div>
        </div>
      </div>
    </div>
  );
}
