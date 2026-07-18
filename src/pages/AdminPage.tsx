import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import { supabase, CATEGORIES, type EventRow, type EventWithCount, type RegistrationRow } from '../lib/supabase';
import { useEvents } from '../hooks/useEvents';
import { useRegistrations } from '../hooks/useRegistrations';
import { useAuth } from '../hooks/useAuth';
import { categoryColor, classNames, formatDate, formatTime, initials } from '../lib/utils';
import { Modal } from '../components/Modal';

export function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
        <div className="card w-full p-7 animate-fade-up text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600">
            <LogIn size={22} />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">Sign in required</h1>
          <p className="mt-1 text-sm text-ink-500">You need an account to access the admin dashboard.</p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-5 w-full">
            <LogIn size={16} /> Go to sign in
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
        <div className="card w-full p-7 animate-fade-up text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert size={22} />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">Admins only</h1>
          <p className="mt-1 text-sm text-ink-500">
            Your account does not have admin access. The first account created in FESTGO becomes the admin.
          </p>
          <button onClick={() => navigate('/')} className="btn-ghost mt-5">
            Back to events
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const { events, loading, error, refetch } = useEvents();
  const { user } = useAuth();
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
  }, [events, search]);

  const totalRegs = events.reduce((s, e) => s + e.registration_count, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Manage events and registrations for FESTGO.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreating(true)} className="btn-accent">
            <Plus size={16} /> New event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Events" value={events.length} />
        <MiniStat label="Registrations" value={totalRegs} />
        <MiniStat label="Upcoming" value={events.filter((e) => new Date(e.event_date).getTime() > Date.now()).length} />
        <MiniStat label="Full events" value={events.filter((e) => e.registration_count >= e.capacity).length} />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-4 relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          className="input pl-9"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card h-64 animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <Users size={26} className="mb-3 text-ink-400" />
          <h3 className="font-display text-base font-semibold text-ink-800">No events yet</h3>
          <p className="mt-1 text-sm text-ink-500">Create your first event to get started.</p>
          <button onClick={() => setCreating(true)} className="btn-primary mt-4">
            <Plus size={16} /> Create event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <AdminEventRow
              key={e.id}
              event={e}
              expanded={expanded === e.id}
              onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
              onEdit={() => setEditing(e)}
              onChanged={refetch}
            />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <EventFormModal
          open={creating || !!editing}
          event={editing}
          userId={user!.id}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="font-display text-2xl font-extrabold text-ink-900">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</div>
    </div>
  );
}

function AdminEventRow({
  event,
  expanded,
  onToggle,
  onEdit,
  onChanged,
}: {
  event: EventWithCount;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const c = categoryColor(event.category);
  const spots = Math.max(0, event.capacity - event.registration_count);
  const fillPct = Math.min(100, Math.round((event.registration_count / event.capacity) * 100));

  const handleDelete = async () => {
    setConfirmingDelete(false);
    await supabase.from('events').delete().eq('id', event.id);
    onChanged();
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button onClick={onToggle} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-900">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-xl sm:block">
          {event.image_url ? (
            <img src={event.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-ink-100" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-sm font-bold text-ink-900">{event.title}</h3>
            <span className={classNames('chip ring-1', c.bg, c.text, c.ring)}>{event.category}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-ink-500">
            {formatDate(event.event_date)} · {formatTime(event.event_date)} · {event.venue}
          </div>
        </div>
        <div className="hidden w-40 sm:block">
          <div className="mb-1 flex justify-between text-xs text-ink-500">
            <span>{event.registration_count}/{event.capacity}</span>
            <span className={spots === 0 ? 'text-rose-600' : 'text-emerald-600'}>{spots === 0 ? 'Full' : `${spots} left`}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className={classNames('h-full rounded-full', fillPct >= 100 ? 'bg-rose-400' : fillPct > 70 ? 'bg-amber-400' : 'bg-sky-400')}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={onEdit} className="rounded-lg p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900">
            <Pencil size={16} />
          </button>
          <button onClick={() => setConfirmingDelete(true)} className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && <RegistrationsPanel eventId={event.id} />}

      {confirmingDelete && (
        <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Delete event?" maxWidth="max-w-sm">
          <div className="p-5">
            <p className="text-sm text-ink-600">
              This will permanently delete <strong className="text-ink-900">{event.title}</strong> and all of its
              registrations. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmingDelete(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleDelete} className="btn bg-rose-600 text-white hover:bg-rose-500">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RegistrationsPanel({ eventId }: { eventId: string }) {
  const { registrations, loading, error, refetch } = useRegistrations(eventId);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('registrations').update({ status }).eq('id', id);
    refetch();
  };

  const remove = async (id: string) => {
    await supabase.from('registrations').delete().eq('id', id);
    refetch();
  };

  return (
    <div className="border-t border-ink-100 bg-ink-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          Registrations ({registrations.length})
        </h4>
      </div>
      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-white" />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : registrations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-6 text-center text-sm text-ink-500">
          No registrations yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Participant</th>
                <th className="hidden px-3 py-2 font-semibold md:table-cell">College</th>
                <th className="hidden px-3 py-2 font-semibold sm:table-cell">Team</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {registrations.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50/50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                        {initials(r.participant_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink-900">{r.participant_name}</div>
                        <div className="truncate text-xs text-ink-500">{r.participant_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-ink-600 md:table-cell">{r.college ?? '—'}</td>
                  <td className="hidden px-3 py-2.5 text-ink-600 sm:table-cell">{r.team_name ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {r.status !== 'checked_in' && (
                        <button
                          onClick={() => updateStatus(r.id, 'checked_in')}
                          title="Check in"
                          className="rounded-lg p-1.5 text-ink-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(r.id, 'cancelled')}
                          title="Cancel"
                          className="rounded-lg p-1.5 text-ink-500 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => remove(r.id)}
                        title="Remove"
                        className="rounded-lg p-1.5 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    registered: 'bg-sky-50 text-sky-700 ring-sky-200',
    checked_in: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  };
  return (
    <span className={classNames('chip ring-1', map[status] ?? 'bg-ink-100 text-ink-700 ring-ink-200')}>
      {status.replace('_', ' ')}
    </span>
  );
}

function EventFormModal({
  open,
  event,
  userId,
  onClose,
  onSaved,
}: {
  open: boolean;
  event: EventRow | null;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!event;
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    event_date: '',
    event_time: '',
    capacity: 100,
    image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      const d = new Date(event.event_date);
      const pad = (n: number) => String(n).padStart(2, '0');
      setForm({
        title: event.title,
        description: event.description ?? '',
        category: CATEGORIES.includes(event.category as never) ? event.category : 'Technical',
        venue: event.venue,
        event_date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        event_time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        capacity: event.capacity,
        image_url: event.image_url ?? '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        category: 'Technical',
        venue: '',
        event_date: '',
        event_time: '10:00',
        capacity: 100,
        image_url: '',
      });
    }
    setErr(null);
  }, [event, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.title.trim() || !form.venue.trim() || !form.event_date) {
      setErr('Title, venue, and date are required.');
      return;
    }
    const iso = new Date(`${form.event_date}T${form.event_time || '10:00'}:00`).toISOString();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      venue: form.venue.trim(),
      event_date: iso,
      capacity: Math.max(1, Number(form.capacity) || 1),
      image_url: form.image_url.trim() || null,
    };
    setSaving(true);
    const { error } = isEdit
      ? await supabase.from('events').update(payload).eq('id', event!.id)
      : await supabase.from('events').insert({ ...payload, created_by: userId });
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit event' : 'Create event'} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4 p-5">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Hackathon 2026" autoFocus />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[90px] resize-y"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the event, rules, prizes..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Capacity</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="label">Venue *</label>
          <input className="input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Main Auditorium" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" className="input" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Cover image URL</label>
          <input className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://images.pexels.com/..." />
        </div>

        {err && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-accent">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isEdit ? 'Save changes' : 'Create event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
